import "dotenv/config";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const endpoint = process.env.STORAGE_ENDPOINT;
const bucket = process.env.STORAGE_BUCKET;
const accessKeyId = process.env.STORAGE_ACCESS_KEY;
const secretAccessKey = process.env.STORAGE_SECRET_KEY;

if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
  throw new Error("R2 storage configuration is incomplete.");
}

const client = new S3Client({
  region: "auto",
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
});

const mediaDirectory = join(process.cwd(), "storage", "media");

async function main() {
  const files = await readdir(mediaDirectory);
  const images = files.filter((file) => /^[a-f0-9-]+\.webp$/i.test(file));

  if (images.length === 0) {
    console.log("No local WebP media files were found.");
    return;
  }

  console.log(`Found ${images.length} media file(s).`);
  let uploaded = 0;
  let failed = 0;

  for (const key of images) {
    try {
      await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: await readFile(join(mediaDirectory, key)),
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      }));
      uploaded += 1;
      console.log(`[${uploaded}/${images.length}] Uploaded ${key}`);
    } catch (error) {
      failed += 1;
      console.error(`Failed to upload ${key}`, error);
    }
  }

  console.log("");
  console.log("Migration complete.");
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Failed: ${failed}`);
  if (failed > 0) process.exitCode = 1;
}

void main();