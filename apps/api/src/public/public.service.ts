import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  getProfile() {
    return this.prisma.profile.findFirst({
      select: {
        name: true,
        title: true,
        bio: true,
        email: true,
        location: true,
        profile_image: true,
        resume_url: true,
        github_url: true,
        linkedin_url: true,
        google_scholar_url: true,
      },
    });
  }

  getProjects() {
    return this.prisma.project.findMany({
      orderBy: [
        { featured: 'desc' },
        { sort_order: 'asc' },
        { created_at: 'desc' },
      ],
      include: {
        project_technology: {
          include: { technology: true },
        },
        project_media: { orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }], include: { media: true } },
      },
    });
  }

  async getProject(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: {
        project_technology: {
          include: { technology: true },
        },
        project_media: { orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }], include: { media: true } },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  getSkills() {
    return this.prisma.skill.findMany({
      orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
    });
  }

  getPublications() {
    return this.prisma.publication.findMany({
      orderBy: [
        { featured: 'desc' },
        { publication_date: 'desc' },
        { title: 'asc' },
      ],
    });
  }

  getCertifications() {
    return this.prisma.certification.findMany({
      orderBy: [
        { featured: 'desc' },
        { sort_order: 'asc' },
        { issue_date: 'desc' },
        { name: 'asc' },
      ],
    });
  }
  getEducation() { return this.prisma.education.findMany({ orderBy: { start_date: 'desc' } }); }
  getExperience() { return this.prisma.experience.findMany({ orderBy: { start_date: 'desc' } }); }
}
