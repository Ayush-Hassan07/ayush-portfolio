import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AdminAuthGuard } from '../auth/admin-auth.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MediaController],
  providers: [MediaService, AdminAuthGuard],
  exports: [MediaService],
})
export class MediaModule {}
