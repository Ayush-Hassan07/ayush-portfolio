import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';

type LoginBody = { email?: unknown; password?: unknown };
type OtpBody = { code?: unknown };
type PasswordBody = {
  currentPassword?: unknown;
  nextPassword?: unknown;
  challengeId?: unknown;
  code?: unknown;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('session')
  session(@Req() request: Request) {
    return {
      authenticated: this.authService.verifySession(
        request.cookies?.admin_session,
      ),
    };
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: LoginBody,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(body.email, body.password);
    response.cookie('otp_challenge', result.challengeId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 1000,
      path: '/auth',
    });
    if (result.session)
      response.cookie('admin_session', result.session, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 60 * 1000,
        path: '/',
      });
    if ('factorToken' in result && result.factorToken)
      response.cookie('login_factor', result.factorToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 1000,
        path: '/auth',
      });
    return result.authenticated
      ? { authenticated: true }
      : {
          requiresOtp: result.requiresEmailOtp,
          requiresTotp: result.requiresTotp,
          expiresIn: result.expiresIn,
        };
  }

  @Post('verify-otp')
  @HttpCode(200)
  async verifyOtp(
    @Body() body: OtpBody,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.verifyOtp(
      request.cookies?.otp_challenge,
      body.code,
    );
    response.clearCookie('otp_challenge', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/auth',
    });
    if (result.session)
      response.cookie('admin_session', result.session, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 60 * 1000,
        path: '/',
      });
    if (result.factorToken)
      response.cookie('login_factor', result.factorToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 1000,
        path: '/auth',
      });
    return result.authenticated
      ? { authenticated: true }
      : { requiresTotp: true };
  }

  @Post('verify-totp')
  @HttpCode(200)
  async verifyLoginTotp(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() body: OtpBody,
  ) {
    const session = await this.authService.verifyLoginTotp(
      request.cookies?.login_factor,
      body.code,
    );
    response.clearCookie('login_factor', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/auth',
    });
    response.cookie('admin_session', session, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 60 * 1000,
      path: '/',
    });
    return { authenticated: true };
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('admin_session', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
  }

  @Post('password-change/request')
  @HttpCode(200)
  async requestPasswordChange(
    @Body() body: PasswordBody,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.requestPasswordChange(
      this.authService.getSessionAdminId(request.cookies?.admin_session),
      body.currentPassword,
      body.nextPassword,
    );
    response.cookie('password_change_challenge', result.challengeId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 1000,
      path: '/auth',
    });
    return { expiresIn: result.expiresIn };
  }

  @Post('password-change/confirm')
  @HttpCode(204)
  async confirmPasswordChange(
    @Body() body: PasswordBody,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.confirmPasswordChange(
      request.cookies?.password_change_challenge,
      body.code,
      body.nextPassword,
    );
    response.clearCookie('password_change_challenge', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/auth',
    });
  }
}
