import {
  Controller,
  Get,
  Param,
  Res,
} from "@nestjs/common";

import type { Response } from "express";

import { MediaService } from "./media.service";

@Controller("media")
export class PublicMediaController {
  constructor(
    private readonly media: MediaService,
  ) {}

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
            "public, max-age=31536000, immutable",
          "X-Content-Type-Options":
            "nosniff",
        })
        .send(file);
    } catch {
      return response.status(404).end();
    }
  }
}