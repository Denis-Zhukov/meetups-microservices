import { LoggerService } from '@/logger/logger.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EnvConfig, JwtPayload, OAuthPayload } from '@/common/types';
import { ConfigService } from '@nestjs/config';
import { RegisterUserDto } from './dto/register-user.dto';
import { compare, genSalt, hash } from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { MailerService } from '@/mailer/mailer.service';
import { PrismaService } from '@/prisma/prisma.service';
import {
  EXCEPTION_MESSAGES,
  getVerifyEmailUrl,
  LOG_MESSAGES,
} from '@/auth/auth.constants';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailer: MailerService,
    private readonly logger: LoggerService,
    private readonly cfgService: ConfigService<EnvConfig>
  ) {}

  private async generateAndStoreTokens(id: string) {
    try {
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

      this.logger.log(LOG_MESSAGES.tokensGenerated(id));

      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error(LOG_MESSAGES.errorGeneratingTokens(id), error.stack);
      throw new InternalServerErrorException(
        EXCEPTION_MESSAGES.tokenGeneration
      );
    }
  }

  public async createUser({ email, password }: RegisterUserDto) {
    const salt = await genSalt();
    const passwordHash = await hash(password, salt);

    const protocol = this.cfgService.getOrThrow('PROTOCOL');
    const host = this.cfgService.getOrThrow('HOST');
    const port = this.cfgService.getOrThrow('PORT');

    try {
      const verifyHash = await this.jwtService.signAsync(
        {},
        {
          secret: this.cfgService.getOrThrow('VERIFY_SECRET'),
          expiresIn: this.cfgService.getOrThrow('VERIFY_EXPIRE_IN'),
        }
      );

      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          verifyHash,
        },
      });
      this.logger.log(LOG_MESSAGES.userCreated(email));

      const verificationLink = getVerifyEmailUrl(
        protocol,
        host,
        port,
        verifyHash
      );
      this.mailer.sendVerificationEmail(email, verificationLink);

      return user;
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        this.logger.warn(LOG_MESSAGES.duplicateEmail(email));
        throw new BadRequestException(
          EXCEPTION_MESSAGES.registrationAlreadyExists
        );
      }
      this.logger.error(LOG_MESSAGES.userCreationError(email), error.stack);
      throw error;
    }
  }

  public async login({ email, password }: LoginUserDto) {
    let user: User | null;

    try {
      user = await this.prisma.user.findUnique({ where: { email } });
    } catch (error) {
      this.logger.error(LOG_MESSAGES.errorLoggingIn(email), error.stack);
      throw new InternalServerErrorException(EXCEPTION_MESSAGES.login);
    }

    if (!user || !password) {
      this.logger.warn(LOG_MESSAGES.failedLogin(email));
      throw new BadRequestException(EXCEPTION_MESSAGES.wrongCredentials);
    }

    if (!user.verified) {
      this.logger.warn(LOG_MESSAGES.emailNotVerified(email));
      throw new BadRequestException(EXCEPTION_MESSAGES.emailNotVerified);
    }

    if (!(await compare(password, user.passwordHash))) {
      this.logger.warn(LOG_MESSAGES.incorrectPassword(email));
      throw new BadRequestException(EXCEPTION_MESSAGES.wrongCredentials);
    }

    this.logger.log(LOG_MESSAGES.userLoggedIn(email));

    return this.generateAndStoreTokens(user.id);
  }

  public async authorize({ email }: OAuthPayload) {
    let user: User;

    try {
      user = await this.prisma.user.upsert({
        where: { email },
        create: { email },
        update: {},
      });
    } catch (error) {
      this.logger.error(LOG_MESSAGES.userCreationError(email), error.stack);
      throw error;
    }

    this.logger.log(LOG_MESSAGES.userAuthorized(email));

    return this.generateAndStoreTokens(user.id);
  }

  public async refreshToken(refreshToken: string) {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.cfgService.get('REFRESH_JWT_SECRET'),
      });
    } catch (error) {
      this.logger.error(
        LOG_MESSAGES.errorRefreshingToken(refreshToken),
        error.stack
      );
      throw new UnauthorizedException();
    }

    this.logger.log(LOG_MESSAGES.tokenRefreshed(payload.id));

    return this.generateAndStoreTokens(payload.id);
  }

  public async verifyEmail(verifyHash: string) {
    try {
      const user = await this.prisma.user.findFirst({ where: { verifyHash } });

      if (!user) throw new BadRequestException(EXCEPTION_MESSAGES.userNotExist);

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
    } catch (error) {
      if (!(error instanceof BadRequestException)) {
        this.logger.warn(LOG_MESSAGES.verifyEmailExpired(verifyHash));
      }
      throw new BadRequestException('Verify hash is expired');
    }
  }

  public async decodeAccessToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.cfgService.getOrThrow('ACCESS_JWT_SECRET'),
      });
    } catch {
      return null;
    }
  }
}
