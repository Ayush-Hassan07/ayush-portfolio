import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { AdminLibraryController } from './admin-library.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdminController, AdminLibraryController],
  providers: [AdminService, AdminAuthGuard],
})
export class AdminModule {}
