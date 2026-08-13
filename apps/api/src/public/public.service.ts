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
        location: true,
        profile_image: true,
        resume_url: true,
        github_url: true,
        linkedin_url: true,
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
}
