import { BadRequestException, Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const MAX_INPUT_BYTES = 10 * 1024 * 1024;
const OUTPUT_DIR = join(process.cwd(), 'storage', 'media');

@Injectable()
export class MediaService {
  async optimizeImage(input: Buffer) {
    if (input.length > MAX_INPUT_BYTES)
      throw new BadRequestException('Image exceeds the 10 MB input limit');
    const image = sharp(input, { failOn: 'error' });
    const metadata = await image.metadata();
    if (!metadata.format || !['jpeg', 'png', 'webp'].includes(metadata.format))
      throw new BadRequestException(
        'Only JPEG, PNG, and WebP images are supported',
      );
    const output = await image
      .rotate()
      .resize({
        width: 1800,
        height: 1200,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 78, effort: 6 })
      .toBuffer();
    await mkdir(OUTPUT_DIR, { recursive: true });
    const key = `${randomUUID()}.webp`;
    await writeFile(join(OUTPUT_DIR, key), output, { flag: 'wx' });
    return {
      key,
      bytes: output.length,
      targetBytes: 50 * 1024,
      optimizedToTarget: output.length <= 50 * 1024,
    };
  }
}
