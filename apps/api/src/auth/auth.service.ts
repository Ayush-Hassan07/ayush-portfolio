import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  createHmac,
  randomBytes,
  randomInt,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

const SESSION_TTL_SECONDS = 30 * 60;
export const OTP_TTL_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(email: unknown, password: unknown) {
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      password.length < 8
    )
      throw new UnauthorizedException('Invalid credentials');
    const admin = await this.prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!admin || !this.verifyPassword(password, admin.password_hash))
      throw new UnauthorizedException('Invalid credentials');

    const settings = await this.prisma.admin_security_settings.findUnique({
      where: { admin_id: admin.id },
    });
    const emailOtpEnabled = settings?.email_otp_enabled ?? true;
    const totpEnabled = settings?.totp_enabled ?? false;
    if (!emailOtpEnabled && !totpEnabled)
      return { authenticated: true, session: this.createSession(admin.id) };
    if (!emailOtpEnabled && totpEnabled)
      return {
        requiresTotp: true,
        factorToken: this.createFactorToken(admin.id),
        expiresIn: OTP_TTL_SECONDS,
      };

    await this.prisma.admin_otp_challenge.deleteMany({
      where: {
        admin_id: admin.id,
        OR: [{ consumed: true }, { expires_at: { lt: new Date() } }],
      },
    });
    const recent = await this.prisma.admin_otp_challenge.count({
      where: {
        admin_id: admin.id,
        created_at: { gt: new Date(Date.now() - 5 * 60 * 1000) },
      },
    });
    if (recent >= 5)
      throw new HttpException('Too many OTP requests. Try again later.', 429);
    const code = randomInt(100000, 1000000).toString();
    const challenge = await this.prisma.admin_otp_challenge.create({
      data: {
        admin_id: admin.id,
        code_hash: AuthService.hashPassword(code),
        expires_at: new Date(Date.now() + OTP_TTL_SECONDS * 1000),
      },
    });
    await this.sendOtp(admin.email, code);
    return {
      challengeId: challenge.id,
      expiresIn: OTP_TTL_SECONDS,
      requiresEmailOtp: emailOtpEnabled,
      requiresTotp: totpEnabled,
    };
  }

  async verifyOtp(challengeId: unknown, code: unknown) {
    if (
      typeof challengeId !== 'string' ||
      typeof code !== 'string' ||
      !/^\d{6}$/.test(code)
    )
      throw new UnauthorizedException('Invalid verification code');
    const challenge = await this.prisma.admin_otp_challenge.findUnique({
      where: { id: challengeId },
    });
    if (
      !challenge ||
      challenge.consumed ||
      challenge.expires_at.getTime() <= Date.now() ||
      challenge.attempts >= OTP_MAX_ATTEMPTS
    )
      throw new UnauthorizedException('Code expired or unavailable');
    if (!this.verifyPassword(code, challenge.code_hash)) {
      await this.prisma.admin_otp_challenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Invalid verification code');
    }
    await this.prisma.admin_otp_challenge.update({
      where: { id: challenge.id },
      data: { consumed: true },
    });
    const settings = await this.prisma.admin_security_settings.findUnique({
      where: { admin_id: challenge.admin_id },
    });
    if (settings?.totp_enabled)
      return {
        requiresTotp: true,
        factorToken: this.createFactorToken(challenge.admin_id),
      };
    return {
      authenticated: true,
      session: this.createSession(challenge.admin_id),
    };
  }

  async verifyLoginTotp(token: unknown, code: unknown) {
    const adminId = this.verifyFactorToken(token);
    const settings = await this.prisma.admin_security_settings.findUnique({
      where: { admin_id: adminId },
    });
    if (!settings?.totp_enabled || !settings.totp_secret_encrypted)
      throw new UnauthorizedException(
        'Authenticator verification is not enabled',
      );
    const { decryptTotpSecret, verifyTotp } = await import('./totp');
    if (
      typeof code !== 'string' ||
      !verifyTotp(
        decryptTotpSecret(settings.totp_secret_encrypted, this.getSecret()),
        code,
      )
    )
      throw new UnauthorizedException('Invalid authenticator code');
    return this.createSession(adminId);
  }

  async requestPasswordChange(
    adminId: string,
    currentPassword: unknown,
    nextPassword: unknown,
  ) {
    if (
      typeof currentPassword !== 'string' ||
      typeof nextPassword !== 'string' ||
      nextPassword.length < 8
    )
      throw new UnauthorizedException('Invalid password change request');
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin || !this.verifyPassword(currentPassword, admin.password_hash))
      throw new UnauthorizedException('Current password is incorrect');
    const code = randomInt(100000, 1000000).toString();
    const challenge = await this.prisma.admin_otp_challenge.create({
      data: {
        admin_id: admin.id,
        code_hash: AuthService.hashPassword(`${code}:${nextPassword}`),
        expires_at: new Date(Date.now() + OTP_TTL_SECONDS * 1000),
      },
    });
    await this.sendOtp(admin.email, code);
    return { challengeId: challenge.id, expiresIn: OTP_TTL_SECONDS };
  }
  async confirmPasswordChange(
    challengeId: unknown,
    code: unknown,
    nextPassword: unknown,
  ) {
    if (
      typeof challengeId !== 'string' ||
      typeof code !== 'string' ||
      typeof nextPassword !== 'string' ||
      !/^\d{6}$/.test(code) ||
      nextPassword.length < 8
    )
      throw new UnauthorizedException('Invalid password change verification');
    const challenge = await this.prisma.admin_otp_challenge.findUnique({
      where: { id: challengeId },
    });
    if (
      !challenge ||
      challenge.consumed ||
      challenge.expires_at.getTime() <= Date.now() ||
      challenge.attempts >= OTP_MAX_ATTEMPTS ||
      !this.verifyPassword(`${code}:${nextPassword}`, challenge.code_hash)
    )
      throw new UnauthorizedException('Code expired or invalid');
    await this.prisma.$transaction([
      this.prisma.admin.update({
        where: { id: challenge.admin_id },
        data: {
          password_hash: AuthService.hashPassword(nextPassword),
          updated_at: new Date(),
        },
      }),
      this.prisma.admin_otp_challenge.update({
        where: { id: challenge.id },
        data: { consumed: true },
      }),
    ]);
  }

  verifySession(token: string | undefined) {
    if (!token) return false;
    const [encoded, signature] = token.split('.');
    if (!encoded || !signature) return false;
    const payload = Buffer.from(encoded, 'base64url').toString('utf8');
    const expected = createHmac('sha256', this.getSecret())
      .update(payload)
      .digest('base64url');
    if (
      signature.length !== expected.length ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    )
      return false;
    return Number(payload.split('.')[1]) > Date.now();
  }
  getSessionAdminId(token: string | undefined) {
    if (!this.verifySession(token))
      throw new UnauthorizedException('Admin authentication required');
    const [encoded] = token!.split('.');
    return Buffer.from(encoded, 'base64url').toString('utf8').split('.')[0];
  }

  private createSession(adminId: string) {
    const payload = `${adminId}.${Date.now() + SESSION_TTL_SECONDS * 1000}`;
    const signature = createHmac('sha256', this.getSecret())
      .update(payload)
      .digest('base64url');
    return `${Buffer.from(payload).toString('base64url')}.${signature}`;
  }
  private createFactorToken(adminId: string) {
    const payload = `${adminId}.${Date.now() + OTP_TTL_SECONDS * 1000}`;
    const signature = createHmac('sha256', this.getSecret())
      .update(`factor:${payload}`)
      .digest('base64url');
    return `${Buffer.from(payload).toString('base64url')}.${signature}`;
  }
  private verifyFactorToken(token: unknown) {
    if (typeof token !== 'string')
      throw new UnauthorizedException('Authentication step expired');
    const [encoded, signature] = token.split('.');
    if (!encoded || !signature)
      throw new UnauthorizedException('Authentication step expired');
    const payload = Buffer.from(encoded, 'base64url').toString('utf8');
    const expected = createHmac('sha256', this.getSecret())
      .update(`factor:${payload}`)
      .digest('base64url');
    if (signature !== expected || Number(payload.split('.')[1]) <= Date.now())
      throw new UnauthorizedException('Authentication step expired');
    return payload.split('.')[0];
  }

  private async sendOtp(recipient: string, code: string) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const password = process.env.SMTP_PASSWORD;
    const from = process.env.SMTP_FROM;
    if (!host || !user || !password || !from || !Number.isInteger(port))
      throw new Error('SMTP configuration is incomplete');
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: password },
    });
    await transporter.sendMail({
      from,
      to: recipient,
      subject: 'Ayush portfolio admin verification code',
      text: `Your verification code is ${code}. It expires in 60 seconds and can be used once.`,
    });
  }

  private verifyPassword(password: string, stored: string) {
    const [algorithm, cost, blockSize, parallel, salt, encodedHash] =
      stored.split('$');
    if (
      algorithm !== 'scrypt' ||
      !cost ||
      !blockSize ||
      !parallel ||
      !salt ||
      !encodedHash
    )
      return false;
    const derived = scryptSync(password, Buffer.from(salt, 'base64url'), 64, {
      N: Number(cost),
      r: Number(blockSize),
      p: Number(parallel),
    });
    const expected = Buffer.from(encodedHash, 'base64url');
    return (
      expected.length === derived.length && timingSafeEqual(expected, derived)
    );
  }
  private getSecret() {
    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.length < 32)
      throw new Error('SESSION_SECRET must be at least 32 characters');
    return secret;
  }
  static hashPassword(value: string) {
    const salt = randomBytes(16);
    const derived = scryptSync(value, salt, 64, { N: 16384, r: 8, p: 1 });
    return `scrypt$16384$8$1$${salt.toString('base64url')}$${derived.toString('base64url')}`;
  }
  static verifyHash(value: string, stored: string) {
    const [algorithm, cost, blockSize, parallel, salt, encodedHash] =
      stored.split('$');
    if (
      algorithm !== 'scrypt' ||
      !cost ||
      !blockSize ||
      !parallel ||
      !salt ||
      !encodedHash
    )
      return false;
    const derived = scryptSync(value, Buffer.from(salt, 'base64url'), 64, {
      N: Number(cost),
      r: Number(blockSize),
      p: Number(parallel),
    });
    const expected = Buffer.from(encodedHash, 'base64url');
    return (
      expected.length === derived.length && timingSafeEqual(expected, derived)
    );
  }
}
