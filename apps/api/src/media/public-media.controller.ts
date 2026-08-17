import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

@Controller('media')
export class PublicMediaController {
  @Get(':key')
  async image(@Param('key') key: string, @Res() response: Response) {
    if (!/^[a-f0-9-]+\.webp$/i.test(key)) return response.status(400).end();
    try {
      return response
        .type('image/webp')
        .send(await readFile(join(process.cwd(), 'storage', 'media', key)));
    } catch {
      return response.status(404).end();
    }
  }
}
