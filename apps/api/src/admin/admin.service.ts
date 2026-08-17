/* eslint-disable @typescript-eslint/no-base-to-string */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '../../generated/prisma/client';
import { randomBytes } from 'node:crypto';
import { encryptTotpSecret, decryptTotpSecret, verifyTotp } from '../auth/totp';
import { AuthService } from '../auth/auth.service';

type ProjectInput = {
  title?: unknown;
  slug?: unknown;
  description?: unknown;
  status?: unknown;
  image_url?: unknown;
  github_url?: unknown;
  live_url?: unknown;
  featured?: unknown;
  sort_order?: unknown;
};

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  listProjects() {
    return this.prisma.project.findMany({
      orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }],
    }).then((projects) => projects.map((project) => ({
      ...project,
      image_url: project.image_url?.startsWith('/')
        ? `${process.env.API_PUBLIC_URL ?? 'http://localhost:4000'}${project.image_url}`
        : project.image_url,
    })));
  }

  async createProject(input: ProjectInput) {
    const data = this.validateProject(input);
    if (await this.prisma.project.findUnique({ where: { slug: data.slug } }))
      throw new ConflictException('A project with this slug already exists');
    return this.prisma.project.create({ data });
  }

  async updateProject(slug: string, input: ProjectInput) {
    if (!(await this.prisma.project.findUnique({ where: { slug } })))
      throw new NotFoundException('Project not found');
    return this.prisma.project.update({
      where: { slug },
      data: this.validateProject(input, true),
    });
  }

  async deleteProject(slug: string) {
    if (!(await this.prisma.project.findUnique({ where: { slug } })))
      throw new NotFoundException('Project not found');
    await this.prisma.project.delete({ where: { slug } });
  }
  listProjectTechnologies(slug: string) {
    return this.prisma.project_technology.findMany({
      where: { project: { slug } },
      include: { technology: true },
    });
  }
  async replaceProjectTechnologies(slug: string, technologyIds: unknown) {
    if (
      !Array.isArray(technologyIds) ||
      technologyIds.some((id) => typeof id !== 'string')
    )
      throw new Error('technologyIds must be an array of ids');
    const project = await this.prisma.project.findUnique({ where: { slug } });
    if (!project) throw new NotFoundException('Project not found');
    await this.prisma.project_technology.deleteMany({
      where: { project_id: project.id },
    });
    if (technologyIds.length)
      await this.prisma.project_technology.createMany({
        data: technologyIds.map((technology_id) => ({
          project_id: project.id,
          technology_id: technology_id as string,
        })),
        skipDuplicates: true,
      });
    return this.listProjectTechnologies(slug);
  }
  async listProjectMedia(slug: string) {
    const rows = await this.prisma.project_media.findMany({ where: { project: { slug } }, orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }], include: { media: true } });
    if (rows.length) return rows;
    const project = await this.prisma.project.findUnique({ where: { slug }, select: { id: true, image_url: true } });
    const key = project?.image_url?.match(/([a-f0-9-]+\.webp)$/i)?.[1];
    if (!project || !key) return rows;
    const media = await this.prisma.media_asset.findUnique({ where: { storage_key: key } });
    return media ? [{ project_id: project.id, media_id: media.id, sort_order: 0, is_primary: true, media }] : rows;
  }
  async replaceProjectMedia(slug: string, mediaIds: unknown) {
    if (!Array.isArray(mediaIds) || mediaIds.some((id) => typeof id !== 'string')) throw new Error('mediaIds must be an array of ids');
    const project = await this.prisma.project.findUnique({ where: { slug } });
    if (!project) throw new Error('Project not found');
    await this.prisma.project_media.deleteMany({ where: { project_id: project.id } });
    if (mediaIds.length) await this.prisma.project_media.createMany({ data: mediaIds.map((media_id, index) => ({ project_id: project.id, media_id: media_id as string, sort_order: index, is_primary: index === 0 })) });
    return this.listProjectMedia(slug);
  }

  listPublications() {
    return this.prisma.publication.findMany({
      orderBy: [
        { featured: 'desc' },
        { publication_date: 'desc' },
        { title: 'asc' },
      ],
    });
  }
  createPublication(input: Record<string, unknown>) {
    return this.prisma.publication.create({
      data: {
        title: String(input.title ?? '').trim(),
        venue: input.venue ? String(input.venue).trim() : null,
        publication_date: input.publication_date
          ? new Date(String(input.publication_date))
          : null,
        paper_url: input.paper_url ? String(input.paper_url).trim() : null,
      description: input.description
          ? String(input.description).trim()
          : null,
        repository_url: input.repository_url
          ? String(input.repository_url).trim()
          : null,
        featured: Boolean(input.featured),
      },
    });
  }
  updatePublication(id: string, input: Record<string, unknown>) {
    return this.prisma.publication.update({
      where: { id },
      data: {
        title:
          input.title === undefined ? undefined : String(input.title).trim(),
        venue:
          input.venue === undefined ? undefined : String(input.venue).trim(),
        publication_date:
          input.publication_date === undefined
            ? undefined
            : new Date(String(input.publication_date)),
        paper_url:
          input.paper_url === undefined
            ? undefined
            : String(input.paper_url).trim(),
      description:
          input.description === undefined
            ? undefined
            : String(input.description).trim(),
        repository_url:
          input.repository_url === undefined
            ? undefined
            : String(input.repository_url).trim(),
        featured:
          input.featured === undefined ? undefined : Boolean(input.featured),
      },
    });
  }
  deletePublication(id: string) {
    return this.prisma.publication.delete({ where: { id } });
  }
  listSkills() {
    return this.prisma.skill.findMany({
      orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
    });
  }
  createSkill(input: Record<string, unknown>) {
    return this.prisma.skill.create({
      data: {
        name: String(input.name ?? '').trim(),
        category: String(input.category ?? '').trim(),
        proficiency:
          input.proficiency === undefined ||
          input.proficiency === null ||
          input.proficiency === ''
            ? null
            : Number(input.proficiency),
        sort_order:
          input.sort_order === undefined ? 0 : Number(input.sort_order),
      },
    });
  }
  updateSkill(id: string, input: Record<string, unknown>) {
    return this.prisma.skill.update({
      where: { id },
      data: {
        name: input.name === undefined ? undefined : String(input.name).trim(),
        category:
          input.category === undefined
            ? undefined
            : String(input.category).trim(),
        proficiency:
          input.proficiency === undefined
            ? undefined
            : input.proficiency === null || input.proficiency === ''
              ? null
              : Number(input.proficiency),
        sort_order:
          input.sort_order === undefined ? undefined : Number(input.sort_order),
      },
    });
  }
  deleteSkill(id: string) {
    return this.prisma.skill.delete({ where: { id } });
  }
  listCertifications() {
    return this.prisma.certification.findMany({
      orderBy: [{ issue_date: 'desc' }, { name: 'asc' }],
    });
  }
  createCertification(input: Record<string, unknown>) {
    return this.prisma.certification.create({
      data: {
        name: String(input.name ?? '').trim(),
        issuer: String(input.issuer ?? '').trim(),
        issue_date: input.issue_date
          ? new Date(String(input.issue_date))
          : null,
        expiry_date: input.expiry_date
          ? new Date(String(input.expiry_date))
          : null,
        credential_id: input.credential_id
          ? String(input.credential_id).trim()
          : null,
        credential_url: input.credential_url
          ? String(input.credential_url).trim()
          : null,
        description: input.description
          ? String(input.description).trim()
          : null,
        image_url: input.image_url ? String(input.image_url).trim() : null,
      },
    });
  }
  updateCertification(id: string, input: Record<string, unknown>) {
    return this.prisma.certification.update({
      where: { id },
      data: {
        name: input.name === undefined ? undefined : String(input.name).trim(),
        issuer:
          input.issuer === undefined ? undefined : String(input.issuer).trim(),
        issue_date:
          input.issue_date === undefined
            ? undefined
            : input.issue_date
              ? new Date(String(input.issue_date))
              : null,
      image_url:
        input.image_url === undefined
          ? undefined
          : input.image_url
            ? String(input.image_url).trim()
            : null,
        expiry_date:
          input.expiry_date === undefined
            ? undefined
            : input.expiry_date
              ? new Date(String(input.expiry_date))
              : null,
        credential_id:
          input.credential_id === undefined
            ? undefined
            : input.credential_id
              ? String(input.credential_id).trim()
              : null,
        credential_url:
          input.credential_url === undefined
            ? undefined
            : input.credential_url
              ? String(input.credential_url).trim()
              : null,
        description:
          input.description === undefined
            ? undefined
            : input.description
              ? String(input.description).trim()
              : null,
        updated_at: new Date(),
      },
    });
  }
  deleteCertification(id: string) {
    return this.prisma.certification.delete({ where: { id } });
  }
  listEducation() {
    return this.prisma.education.findMany({ orderBy: { start_date: 'desc' } });
  }
  createEducation(i: Record<string, unknown>) {
    return this.prisma.education.create({
      data: {
        institution: String(i.institution ?? '').trim(),
        degree: String(i.degree ?? '').trim(),
        field: i.field ? String(i.field).trim() : null,
        start_date: new Date(String(i.start_date)),
        end_date: i.end_date ? new Date(String(i.end_date)) : null,
        description: i.description ? String(i.description) : null,
        institution_url: i.institution_url ? String(i.institution_url) : null,
      },
    });
  }
  updateEducation(id: string, i: Record<string, unknown>) {
    return this.prisma.education.update({
      where: { id },
      data: {
        institution:
          i.institution === undefined
            ? undefined
            : String(i.institution).trim(),
        degree: i.degree === undefined ? undefined : String(i.degree).trim(),
        field:
          i.field === undefined
            ? undefined
            : i.field
              ? String(i.field).trim()
              : null,
        start_date:
          i.start_date === undefined
            ? undefined
            : new Date(String(i.start_date)),
        end_date:
          i.end_date === undefined
            ? undefined
            : i.end_date
              ? new Date(String(i.end_date))
              : null,
        description:
          i.description === undefined
            ? undefined
            : i.description
              ? String(i.description)
              : null,
        institution_url:
          i.institution_url === undefined
            ? undefined
            : i.institution_url
              ? String(i.institution_url)
              : null,
        updated_at: new Date(),
      },
    });
  }
  deleteEducation(id: string) {
    return this.prisma.education.delete({ where: { id } });
  }
  listExperience() {
    return this.prisma.experience.findMany({ orderBy: { start_date: 'desc' } });
  }
  createExperience(i: Record<string, unknown>) {
    return this.prisma.experience.create({
      data: {
        company: String(i.company ?? '').trim(),
        position: String(i.position ?? '').trim(),
        location: i.location ? String(i.location).trim() : null,
        start_date: new Date(String(i.start_date)),
        end_date: i.end_date ? new Date(String(i.end_date)) : null,
        description: String(i.description ?? ''),
        company_url: i.company_url ? String(i.company_url) : null,
      },
    });
  }
  updateExperience(id: string, i: Record<string, unknown>) {
    return this.prisma.experience.update({
      where: { id },
      data: {
        company: i.company === undefined ? undefined : String(i.company).trim(),
        position:
          i.position === undefined ? undefined : String(i.position).trim(),
        location:
          i.location === undefined
            ? undefined
            : i.location
              ? String(i.location).trim()
              : null,
        start_date:
          i.start_date === undefined
            ? undefined
            : new Date(String(i.start_date)),
        end_date:
          i.end_date === undefined
            ? undefined
            : i.end_date
              ? new Date(String(i.end_date))
              : null,
        description:
          i.description === undefined ? undefined : String(i.description),
        company_url:
          i.company_url === undefined
            ? undefined
            : i.company_url
              ? String(i.company_url)
              : null,
        updated_at: new Date(),
      },
    });
  }
  deleteExperience(id: string) {
    return this.prisma.experience.delete({ where: { id } });
  }
  getProfile() {
    return this.prisma.profile.findFirst();
  }
  async updateProfileImage(storageKey: string) {
    const profile = await this.prisma.profile.findFirst();
    if (!profile) throw new Error('Profile record does not exist');
    return this.prisma.profile.update({
      where: { id: profile.id },
      data: { profile_image: storageKey },
    });
  }
  async updateProfile(input: Record<string, unknown>) {
    const current = await this.prisma.profile.findFirst();
    const data = {
      name: input.name === undefined ? undefined : String(input.name).trim(),
      title: input.title === undefined ? undefined : String(input.title).trim(),
      bio: input.bio === undefined ? undefined : String(input.bio).trim(),
      email: input.email === undefined ? undefined : String(input.email).trim(),
      profile_image:
        input.profile_image === undefined
          ? undefined
          : String(input.profile_image).trim() || null,
      phone:
        input.phone === undefined
          ? undefined
          : String(input.phone).trim() || null,
      location:
        input.location === undefined
          ? undefined
          : String(input.location).trim() || null,
      github_url:
        input.github_url === undefined
          ? undefined
          : String(input.github_url).trim() || null,
      linkedin_url:
        input.linkedin_url === undefined
          ? undefined
          : String(input.linkedin_url).trim() || null,
    };
    if (current)
      return this.prisma.profile.update({ where: { id: current.id }, data });
    return this.prisma.profile.create({
      data: {
        name: String(input.name ?? ''),
        title: String(input.title ?? ''),
        bio: String(input.bio ?? ''),
        email: String(input.email ?? ''),
      },
    });
  }
  listTechnologies() {
    return this.prisma.technology.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      include: { skill: true },
    });
  }
  createTechnology(input: Record<string, unknown>) {
    return this.prisma.technology.create({
      data: {
        name: String(input.name ?? '').trim(),
        category: input.category ? String(input.category).trim() : null,
        icon_url: input.icon_url ? String(input.icon_url).trim() : null,
        skill_id: input.skill_id ? String(input.skill_id) : null,
      },
    });
  }
  async getSecurity() {
    const admin = await this.prisma.admin.findFirst({ select: { id: true } });
    if (!admin) return null;
    return this.prisma.admin_security_settings.findUnique({
      where: { admin_id: admin.id },
      select: { email_otp_enabled: true, totp_enabled: true, updated_at: true },
    });
  }
  async updateSecurity(input: {
    emailOtpEnabled?: unknown;
    totpEnabled?: unknown;
  }) {
    const admin = await this.prisma.admin.findFirst({ select: { id: true } });
    if (!admin) throw new NotFoundException('Admin not found');
    return this.prisma.admin_security_settings.upsert({
      where: { admin_id: admin.id },
      update: {
        email_otp_enabled:
          input.emailOtpEnabled === undefined
            ? undefined
            : Boolean(input.emailOtpEnabled),
        totp_enabled:
          input.totpEnabled === undefined
            ? undefined
            : Boolean(input.totpEnabled),
        updated_at: new Date(),
      },
      create: {
        admin_id: admin.id,
        email_otp_enabled: input.emailOtpEnabled !== false,
        totp_enabled: input.totpEnabled === true,
      },
    });
  }
  async beginTotp(adminId: string) {
    const secret = randomBytes(20).toString('hex').slice(0, 32).toUpperCase();
    await this.prisma.admin_security_settings.upsert({
      where: { admin_id: adminId },
      update: {
        totp_pending_secret_encrypted: encryptTotpSecret(secret, this.secret()),
      },
      create: {
        admin_id: adminId,
        totp_pending_secret_encrypted: encryptTotpSecret(secret, this.secret()),
      },
    });
    return {
      secret,
      otpauthUri: `otpauth://totp/Ayush%20Portfolio?secret=${secret}&issuer=Ayush%20Portfolio&algorithm=SHA1&digits=6&period=30`,
    };
  }
  async confirmTotp(adminId: string, code: unknown) {
    const settings = await this.prisma.admin_security_settings.findUnique({
      where: { admin_id: adminId },
    });
    if (typeof code !== 'string' || !settings?.totp_pending_secret_encrypted)
      throw new Error('Invalid TOTP enrollment');
    const secret = decryptTotpSecret(
      settings.totp_pending_secret_encrypted,
      this.secret(),
    );
    if (!verifyTotp(secret, code)) throw new Error('Invalid TOTP code');
    return this.prisma.admin_security_settings.update({
      where: { admin_id: adminId },
      data: {
        totp_enabled: true,
        totp_secret_encrypted: settings.totp_pending_secret_encrypted,
        totp_pending_secret_encrypted: null,
      },
      select: { totp_enabled: true },
    });
  }
  async requestSecurityChange(
    adminId: string,
    input: { emailOtpEnabled?: unknown; totpEnabled?: unknown },
  ) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) throw new NotFoundException('Admin not found');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const challenge = await this.prisma.admin_otp_challenge.create({
      data: {
        admin_id: adminId,
        code_hash: AuthService.hashPassword(
          `${code}:${Boolean(input.emailOtpEnabled)}:${Boolean(input.totpEnabled)}`,
        ),
        expires_at: new Date(Date.now() + 60000),
      },
    });
    await this.sendSecurityOtp(admin.email, code);
    return { challengeId: challenge.id, expiresIn: 60 };
  }
  async confirmSecurityChange(
    adminId: string,
    input: { code?: unknown; emailOtpEnabled?: unknown; totpEnabled?: unknown },
  ) {
    if (typeof input.code !== 'string')
      throw new Error('Verification code required');
    const challenge = await this.prisma.admin_otp_challenge.findFirst({
      where: {
        id: { not: undefined },
        admin_id: adminId,
        consumed: false,
        expires_at: { gt: new Date() },
      },
      orderBy: { created_at: 'desc' },
    });
    if (
      !challenge ||
      !this.verifySecurityHash(
        input.code,
        input.emailOtpEnabled,
        input.totpEnabled,
        challenge.code_hash,
      )
    )
      throw new Error('Invalid security verification');
    await this.prisma.$transaction([
      this.prisma.admin_security_settings.upsert({
        where: { admin_id: adminId },
        update: {
          email_otp_enabled: Boolean(input.emailOtpEnabled),
          totp_enabled: Boolean(input.totpEnabled),
          updated_at: new Date(),
        },
        create: {
          admin_id: adminId,
          email_otp_enabled: Boolean(input.emailOtpEnabled),
          totp_enabled: Boolean(input.totpEnabled),
        },
      }),
      this.prisma.admin_otp_challenge.update({
        where: { id: challenge.id },
        data: { consumed: true },
      }),
    ]);
    return { updated: true };
  }
  private verifySecurityHash(
    code: string,
    email: unknown,
    totp: unknown,
    hash: string,
  ) {
    return AuthService.verifyHash(
      `${code}:${Boolean(email)}:${Boolean(totp)}`,
      hash,
    );
  }
  private async sendSecurityOtp(recipient: string, code: string) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const password = process.env.SMTP_PASSWORD;
    const from = process.env.SMTP_FROM;
    if (!host || !user || !password || !from)
      throw new Error('SMTP configuration is incomplete');
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: password },
    });
    await transporter.sendMail({
      from,
      to: recipient,
      subject: 'Portfolio security change verification',
      text: `Your security settings verification code is ${code}. It expires in 60 seconds.`,
    });
  }
  private secret() {
    const value = process.env.SESSION_SECRET;
    if (!value || value.length < 32)
      throw new Error('SESSION_SECRET must be at least 32 characters');
    return value;
  }

  private validateProject(input: ProjectInput, partial = false) {
    const text = (value: unknown, field: string, required: boolean) => {
      if (value === undefined) return undefined;
      if (value === null && !required) return null;
      if (typeof value !== 'string' || (!value.trim() && required))
        throw new Error(`${field} is required`);
      return value.trim() || null;
    };
    const title = text(input.title, 'title', true);
    const slug = text(input.slug, 'slug', true);
    if (typeof slug === 'string' && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
      throw new Error('slug must use lowercase letters, numbers, and hyphens');
    const status =
      input.status === undefined && partial
        ? undefined
        : text(input.status ?? 'draft', 'status', true);
    const allowedStatuses = [
      'draft',
      'planned',
      'ongoing',
      'finished',
      'paused',
      'archived',
    ];
    if (typeof status === 'string' && !allowedStatuses.includes(status))
      throw new Error(
        'status must be draft, planned, ongoing, finished, paused, or archived',
      );
    const description = text(input.description, 'description', true);
    const data = {
      title,
      slug,
      description,
      status,
      image_url: (() => {
        const value = text(input.image_url, 'image_url', false);
        if (value === '\\1') return null;
        if (typeof value === 'string') {
          try {
            const parsed = new URL(value);
            if (parsed.pathname.startsWith('/media/')) return parsed.pathname;
          } catch { /* keep relative or validated external URL */ }
        }
        return value;
      })(),
      github_url: text(input.github_url, 'github_url', false),
      live_url: text(input.live_url, 'live_url', false),
      featured:
        input.featured === undefined ? undefined : Boolean(input.featured),
      sort_order:
        input.sort_order === undefined ? undefined : Number(input.sort_order),
    };
    return Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    ) as unknown as Prisma.projectCreateInput;
  }
}
