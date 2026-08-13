import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { AdminService } from './admin.service';

@Controller('admin/library')
@UseGuards(AdminAuthGuard)
export class AdminLibraryController {
  constructor(private readonly service: AdminService) {}
  @Get('publications') listPublications() {
    return this.service.listPublications();
  }
  @Post('publications') createPublication(
    @Body() body: Record<string, unknown>,
  ) {
    return this.service.createPublication(body);
  }
  @Put('publications/:id') updatePublication(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.service.updatePublication(id, body);
  }
  @Delete('publications/:id') deletePublication(@Param('id') id: string) {
    return this.service.deletePublication(id);
  }
  @Get('skills') listSkills() {
    return this.service.listSkills();
  }
  @Post('skills') createSkill(@Body() body: Record<string, unknown>) {
    return this.service.createSkill(body);
  }
  @Put('skills/:id') updateSkill(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.service.updateSkill(id, body);
  }
  @Delete('skills/:id') deleteSkill(@Param('id') id: string) {
    return this.service.deleteSkill(id);
  }
  @Get('profile') getProfile() {
    return this.service.getProfile();
  }
  @Put('profile') updateProfile(@Body() body: Record<string, unknown>) {
    return this.service.updateProfile(body);
  }
  @Get('technologies') technologies() {
    return this.service.listTechnologies();
  }
  @Post('security/totp/begin') beginTotp(@Req() request: Request) {
    return this.service.beginTotp(this.adminId(request));
  }
  @Post('security/totp/confirm') confirmTotp(
    @Req() request: Request,
    @Body() body: { code?: unknown },
  ) {
    return this.service.confirmTotp(this.adminId(request), body.code);
  }
  private adminId(request: Request) {
    const cookies = request.cookies as Record<string, unknown> | undefined;
    const token = cookies?.admin_session;
    if (typeof token !== 'string')
      throw new UnauthorizedException('Admin authentication required');
    const [encoded] = token.split('.');
    return Buffer.from(encoded, 'base64url').toString('utf8').split('.')[0];
  }
  @Get('security') getSecurity() {
    return this.service.getSecurity();
  }
  @Put('security') updateSecurity(
    @Body() body: { emailOtpEnabled?: unknown; totpEnabled?: unknown },
  ) {
    return this.service.updateSecurity(body);
  }
  @Post('security/change/request') requestSecurityChange(
    @Req() request: Request,
    @Body() body: { emailOtpEnabled?: unknown; totpEnabled?: unknown },
  ) {
    return this.service.requestSecurityChange(this.adminId(request), body);
  }
  @Post('security/change/confirm') confirmSecurityChange(
    @Req() request: Request,
    @Body()
    body: { code?: unknown; emailOtpEnabled?: unknown; totpEnabled?: unknown },
  ) {
    return this.service.confirmSecurityChange(this.adminId(request), body);
  }
}
