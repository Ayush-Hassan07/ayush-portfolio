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
  @Get('certifications') listCertifications() {
    return this.service.listCertifications();
  }
  @Post('certifications') createCertification(
    @Body() body: Record<string, unknown>,
  ) {
    return this.service.createCertification(body);
  }
  @Put('certifications/:id') updateCertification(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.service.updateCertification(id, body);
  }
  @Delete('certifications/:id') deleteCertification(@Param('id') id: string) {
    return this.service.deleteCertification(id);
  }
  @Get('education') listEducation() {
    return this.service.listEducation();
  }
  @Post('education') createEducation(@Body() body: Record<string, unknown>) {
    return this.service.createEducation(body);
  }
  @Put('education/:id') updateEducation(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.service.updateEducation(id, body);
  }
  @Delete('education/:id') deleteEducation(@Param('id') id: string) {
    return this.service.deleteEducation(id);
  }
  @Get('experience') listExperience() {
    return this.service.listExperience();
  }
  @Post('experience') createExperience(@Body() body: Record<string, unknown>) {
    return this.service.createExperience(body);
  }
  @Put('experience/:id') updateExperience(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.service.updateExperience(id, body);
  }
  @Delete('experience/:id') deleteExperience(@Param('id') id: string) {
    return this.service.deleteExperience(id);
  }
  @Get('profile') getProfile() {
    return this.service.getProfile();
  }
  @Put('profile') updateProfile(@Body() body: Record<string, unknown>) {
    return this.service.updateProfile(body);
  }
  @Put('profile/image') updateProfileImage(
    @Body() body: { storage_key?: unknown },
  ) {
    if (
      typeof body.storage_key !== 'string' ||
      !/^[a-f0-9-]+\.webp$/i.test(body.storage_key)
    )
      throw new UnauthorizedException('Invalid profile image path');
    return this.service.updateProfileImage(body.storage_key);
  }
  @Get('technologies') technologies() {
    return this.service.listTechnologies();
  }
  @Post('technologies') createTechnology(
    @Body() body: Record<string, unknown>,
  ) {
    return this.service.createTechnology(body);
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
