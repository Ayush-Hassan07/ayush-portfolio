import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";

import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";

import { AdminAuthGuard } from "../auth/admin-auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import { MediaService } from "./media.service";

@Controller("admin/media")
@UseGuards(AdminAuthGuard)
export class MediaController {
  constructor(
    private readonly media: MediaService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async list() {
    return this.prisma.media_asset.findMany({
      orderBy: {
        created_at: "desc",
      },
    });
  }

  @Get(":key")
  async image(
    @Param("key") key: string,
    @Res() response: Response,
  ) {
    if (!/^[a-f0-9-]+\.webp$/i.test(key)) {
      return response.status(400).end();
    }

    try {
      const file =
        await this.media.getImage(key);

      if (!file) {
        return response.status(404).end();
      }

      return response
        .type("image/webp")
        .set({
          "Cache-Control":
            "private, max-age=3600",
          "X-Content-Type-Options":
            "nosniff",
        })
        .send(file);
    } catch {
      return response.status(404).end();
    }
  }

  @Post("image")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async upload(
    @UploadedFile()
    file: { buffer: Buffer } | undefined,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException(
        "An image file is required",
      );
    }

    const result =
      await this.media.optimizeImage(
        file.buffer,
      );

    try {
      return await this.prisma.media_asset.create({
        data: {
          storage_key: result.key,
          mime_type: "image/webp",
          byte_size: result.bytes,
        },
      });
    } catch (error) {
      await this.media
        .deleteImage(result.key)
        .catch(() => undefined);

      throw error;
    }
  }

  @Delete(":key")
  async remove(
    @Param("key") key: string,
  ) {
    if (!/^[a-f0-9-]+\.webp$/i.test(key)) {
      throw new BadRequestException(
        "Invalid media key",
      );
    }

    const asset =
      await this.prisma.media_asset.findUnique({
        where: {
          storage_key: key,
        },
      });

    if (!asset) {
      throw new BadRequestException(
        "Media asset not found",
      );
    }

    const used =
      await this.prisma.project.count({
        where: {
          image_url: {
            endsWith: key,
          },
        },
      });

    if (used) {
      throw new BadRequestException(
        "Media asset is used by a project",
      );
    }

    await this.media.deleteImage(key);

    await this.prisma.media_asset.delete({
      where: {
        storage_key: key,
      },
    });

    return {
      deleted: true,
    };
  }
}