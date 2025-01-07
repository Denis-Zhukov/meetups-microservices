import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { GoogleOAuthGuard } from './guards/google-o-auth-guard.service';
import { AuthService } from './auth.service';
import { EnvConfig, OAuthPayload } from '@/common/types';
import { User } from '@/common/decorators/user.decarator';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cfgService: ConfigService<EnvConfig>
  ) {}

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/',
      // The value in the config is stored in seconds, and maxAge stores the value in milliseconds.
      maxAge: this.cfgService.getOrThrow('REFRESH_JWT_EXPIRE_IN') * 1000,
    });
  }

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.createUser(registerUserDto);
  }

  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginUserDto);
    this.setRefreshTokenCookie(res, refreshToken);

    return { accessToken };
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthCallback(
    @User() user: OAuthPayload,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken } =
      await this.authService.authorize(user);
    this.setRefreshTokenCookie(res, refreshToken);

    return { accessToken };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies['refreshToken'];
    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshToken(refreshToken);
    this.setRefreshTokenCookie(res, newRefreshToken);

    return { accessToken };
  }

  @Get('verify/:hash')
  async verifyEmail(@Param('hash') hash: string) {
    await this.authService.verifyEmail(hash);
  }
}
