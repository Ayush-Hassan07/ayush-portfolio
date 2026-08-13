import {
  Controller,
  Get,
  Param,
  Res,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { MediaService } from './media.service';
import { PrismaService } from '../prisma/prisma.service';
import type { Response } from 'express';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

@Controller('admin/media')
@UseGuards(AdminAuthGuard)
export class MediaController {
  constructor(
    private readonly media: MediaService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async list() {
    return this.prisma.media_asset.findMany({ orderBy: { created_at: 'desc' } });
  }

  @Get(':key')
  async image(@Param('key') key: string, @Res() response: Response) {
    if (!/^[a-f0-9-]+\.webp$/i.test(key)) return response.status(400).end();
    try {
      const file = await readFile(join(process.cwd(), 'storage', 'media', key));
      return response.type('image/webp').send(file);
    } catch {
      return response.status(404).end();
    }
  }

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  async upload(@UploadedFile() file: { buffer: Buffer } | undefined) {
    if (!file?.buffer)
      throw new BadRequestException('An image file is required');
    const result = await this.media.optimizeImage(file.buffer);
    return this.prisma.media_asset.create({
      data: {
        storage_key: result.key,
        mime_type: 'image/webp',
        byte_size: result.bytes,
      },
    });
  }
}
