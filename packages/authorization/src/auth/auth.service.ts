import { LoggerService } from '@/logger/logger.service';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { EnvConfig, JwtPayload, OAuthPayload } from '@/common/types';
import { ConfigService } from '@nestjs/config';
import { RegisterUserDto } from './dto/register-user.dto';
import { hash, genSalt, compare } from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { MailerService } from '@/mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly jwtService: JwtService,
    private readonly cfgService: ConfigService<EnvConfig>,
    private readonly logger: LoggerService,
    private readonly mailer: MailerService
  ) {}

  private async generateAndStoreTokens(id: string) {
    const accessToken = await this.jwtService.signAsync(
      { id },
      {
        secret: this.cfgService.getOrThrow('ACCESS_JWT_SECRET'),
        expiresIn: this.cfgService.getOrThrow('ACCESS_JWT_EXPIRE_IN'),
      }
    );

    const refreshToken = await this.jwtService.signAsync(
      { id },
      {
        secret: this.cfgService.getOrThrow('REFRESH_JWT_SECRET'),
        expiresIn: this.cfgService.getOrThrow('REFRESH_JWT_EXPIRE_IN'),
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

    const protocol = this.cfgService.getOrThrow('PROTOCOL');
    const host = this.cfgService.getOrThrow('HOST');
    const port = this.cfgService.getOrThrow('PORT');
    // TODO: Replace to real hash(v4) + redis
    const verifyHash = await this.jwtService.signAsync(
      {},
      {
        secret: this.cfgService.getOrThrow('VERIFY_SECRET'),
        expiresIn: this.cfgService.getOrThrow('VERIFY_EXPIRE_IN'),
      }
    );

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          verifyHash,
        },
      });
      this.logger.log(`User created with email: ${email}`);

      const verificationLink = `${protocol}://${host}:${port}/api/auth/verify/${verifyHash}`;
      await this.mailer.sendVerificationEmail(email, verificationLink);

      return user;
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        this.logger.warn(
          `Attempt to create user with duplicate email: ${email}`
        );
        throw new HttpException(
          'User with this email already exists',
          HttpStatus.BAD_REQUEST
        );
      }
      this.logger.error(
        `Error creating user with email: ${email}`,
        error.stack
      );
      throw error;
    }
  }

  public async login({ email, password }: LoginUserDto) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      this.logger.warn(
        `Failed login attempt: User with email ${email} not found.`
      );
      throw new HttpException(
        'Email or password are incorrect',
        HttpStatus.BAD_REQUEST
      );
    }

    if (!user.verified) {
      this.logger.warn(
        `Failed login attempt: User with email ${email} not verified.`
      );
      throw new HttpException('Email is not verified', HttpStatus.BAD_REQUEST);
    }

    if (!(await compare(password, user.passwordHash))) {
      this.logger.warn(
        `Failed login attempt: Incorrect password for email ${email}.`
      );
      throw new HttpException(
        'Email or password are incorrect',
        HttpStatus.BAD_REQUEST
      );
    }

    this.logger.log(`User ${email} logged in successfully.`);

    return this.generateAndStoreTokens(user.id);
  }

  public async authorize(payload: OAuthPayload) {
    const { email } = payload;
    try {
      const { id } = await this.prisma.user.upsert({
        where: { email },
        create: { email },
        update: {},
      });

      this.logger.log(`User authorized with email: ${email}`);

      return this.generateAndStoreTokens(id);
    } catch (error) {
      this.logger.error(
        `Error creating user with email: ${email}`,
        error.stack
      );
      throw error;
    }
  }

  public async refreshToken(refreshToken: string) {
    try {
      const { id } = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.cfgService.get('REFRESH_JWT_SECRET'),
        }
      );

      this.logger.log(`Token refreshed for user with ID: ${id}`);
      return this.generateAndStoreTokens(id);
    } catch (error) {
      this.logger.error('Error refreshing token', error.stack);

      throw new UnauthorizedException();
    }
  }

  public async verifyEmail(verifyHash: string) {
    const user = await this.prisma.user.findFirst({ where: { verifyHash } });
    if (!user)
      throw new HttpException('Wrong verify hash', HttpStatus.BAD_REQUEST);

    try {
      await this.jwtService.verifyAsync(verifyHash, {
        secret: this.cfgService.getOrThrow('VERIFY_SECRET'),
      });
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          verified: true,
          verifyHash: null,
        },
      });
    } catch {
      throw new HttpException('Verify hash is expired', HttpStatus.BAD_REQUEST);
    }
  }
}
