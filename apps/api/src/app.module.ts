import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PublicModule } from './public/public.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [PrismaModule, PublicModule, AuthModule, AdminModule, MediaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
