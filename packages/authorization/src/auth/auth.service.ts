import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { EnvConfig, JwtPayload, OAuthPayload } from '../../types';
import { ConfigService } from '@nestjs/config';
import { RegisterUserDto } from './dto/register-user.dto';
import { hash, genSalt, compare } from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly jwtService: JwtService,
    private readonly cfgService: ConfigService<EnvConfig>
  ) {}

  private async generateAndStoreTokens(id: number) {
    const accessToken = await this.jwtService.signAsync(
      { id },
      {
        secret: this.cfgService.get('ACCESS_JWT_SECRET'),
        expiresIn: this.cfgService.get('ACCESS_JWT_EXPIRE_IN'),
      }
    );

    const refreshToken = await this.jwtService.signAsync(
      { id },
      {
        secret: this.cfgService.get('REFRESH_JWT_SECRET'),
        expiresIn: this.cfgService.get('REFRESH_JWT_EXPIRE_IN'),
      }
    );

    await this.prisma.user.update({
      where: { id },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  }

  public async createUser({ email, password }: RegisterUserDto) {
    const salt = await genSalt();
    const passwordHash = await hash(password, salt);

    try {
      return await this.prisma.user.create({
        data: {
          email,
          passwordHash,
        },
      });
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new HttpException(
          'User with this email already exists',
          HttpStatus.BAD_REQUEST
        );
      }
      throw error;
    }
  }

  public async login({ email, password }: LoginUserDto) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !(await compare(password, user.passwordHash))) {
      throw new HttpException(
        'Email or password are incorrect',
        HttpStatus.BAD_REQUEST
      );
    }

    return this.generateAndStoreTokens(user.id);
  }

  public async authorize(payload: OAuthPayload) {
    const { email } = payload;

    const { id } = await this.prisma.user.upsert({
      where: { email },
      create: { email },
      update: {},
    });

    return this.generateAndStoreTokens(id);
  }

  public async refreshToken(refreshToken: string) {
    try {
      const { id } = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.cfgService.get('REFRESH_JWT_SECRET'),
        }
      );

      return this.generateAndStoreTokens(id);
    } catch {
      throw new UnauthorizedException();
    }
  }
}
