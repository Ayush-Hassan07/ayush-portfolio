import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { AdminService } from './admin.service';

@Controller('admin/projects')
@UseGuards(AdminAuthGuard)
export class AdminController {
  constructor(private readonly service: AdminService) {}
  @Get() list() {
    return this.service.listProjects();
  }
  @Post() create(@Body() body: Record<string, unknown>) {
    return this.service.createProject(body);
  }
  @Put(':slug') update(
    @Param('slug') slug: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.service.updateProject(slug, body);
  }
  @Delete(':slug') remove(@Param('slug') slug: string) {
    return this.service.deleteProject(slug);
  }
  @Get(':slug/technologies') technologies(@Param('slug') slug: string) {
    return this.service.listProjectTechnologies(slug);
  }
  @Put(':slug/technologies') replaceTechnologies(
    @Param('slug') slug: string,
    @Body() body: { technologyIds?: unknown },
  ) {
    return this.service.replaceProjectTechnologies(slug, body.technologyIds);
  }
}
