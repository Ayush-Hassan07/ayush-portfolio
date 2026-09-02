import {
  BadRequestException,
  Injectable,
} from "@nestjs/common";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";

import sharp from "sharp";

const MAX_INPUT_BYTES = 10 * 1024 * 1024;

@Injectable()
export class MediaService {
  private readonly bucket: string;
  private readonly client: S3Client;

  constructor() {
    const endpoint = process.env.STORAGE_ENDPOINT;
    const bucket = process.env.STORAGE_BUCKET;
    const accessKeyId =
      process.env.STORAGE_ACCESS_KEY;
    const secretAccessKey =
      process.env.STORAGE_SECRET_KEY;

    if (
      !endpoint ||
      !bucket ||
      !accessKeyId ||
      !secretAccessKey
    ) {
      throw new Error(
        "R2 storage configuration is incomplete.",
      );
    }

    this.bucket = bucket;

    this.client = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async optimizeImage(input: Buffer) {
    if (input.length > MAX_INPUT_BYTES) {
      throw new BadRequestException(
        "Image exceeds the 10 MB input limit",
      );
    }

    const image = sharp(input, {
      failOn: "error",
    });

    const metadata = await image.metadata();

    if (
      !metadata.format ||
      !["jpeg", "png", "webp"].includes(
        metadata.format,
      )
    ) {
      throw new BadRequestException(
        "Only JPEG, PNG, and WebP images are supported",
      );
    }

    const output = await image
      .rotate()
      .resize({
        width: 1800,
        height: 1200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 78,
        effort: 6,
      })
      .toBuffer();

    const key = `${randomUUID()}.webp`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: output,
        ContentType: "image/webp",
        CacheControl:
          "public, max-age=31536000, immutable",
      }),
    );

    return {
      key,
      bytes: output.length,
      targetBytes: 50 * 1024,
      optimizedToTarget:
        output.length <= 50 * 1024,
    };
  }

  async getImage(key: string) {
    const result = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    if (!result.Body) {
      return null;
    }

    return this.bodyToBuffer(result.Body);
  }

  async deleteImage(key: string) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  private async bodyToBuffer(
    body: unknown,
  ): Promise<Buffer> {
    if (
      body &&
      typeof body === "object" &&
      "transformToByteArray" in body &&
      typeof (
        body as {
          transformToByteArray?: unknown;
        }
      ).transformToByteArray === "function"
    ) {
      const bytes = await (
        body as {
          transformToByteArray: () => Promise<Uint8Array>;
        }
      ).transformToByteArray();

      return Buffer.from(bytes);
    }

    if (body instanceof Readable) {
      const chunks: Buffer[] = [];

      for await (const chunk of body) {
        chunks.push(
          Buffer.isBuffer(chunk)
            ? chunk
            : Buffer.from(chunk),
        );
      }

      return Buffer.concat(chunks);
    }

    throw new Error(
      "Unsupported R2 response body.",
    );
  }
}