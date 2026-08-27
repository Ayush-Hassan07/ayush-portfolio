import { Controller, Get, Param } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('profile')
  getProfile() {
    return this.publicService.getProfile();
  }

  @Get('projects')
  getProjects() {
    return this.publicService.getProjects();
  }

  @Get('projects/:slug')
  getProject(@Param('slug') slug: string) {
    return this.publicService.getProject(slug);
  }

  @Get('skills')
  getSkills() {
    return this.publicService.getSkills();
  }

  @Get('publications')
  getPublications() {
    return this.publicService.getPublications();
  }
  @Get('certifications')
  getCertifications() {
    return this.publicService.getCertifications();
  }
  @Get('education') getEducation() { return this.publicService.getEducation(); }
  @Get('experience') getExperience() { return this.publicService.getExperience(); }
}
