import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from '@/user/user.module';
import { MailerModule } from './mailer/mailer.module';
import { PrismaModule } from './prisma/prisma.module';
import * as parseDotenv from 'dotenv-parse-variables';
import { LoggerModule } from '@/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => parseDotenv(config),
    }),
    AuthModule,
    UserModule,
    MailerModule,
    PrismaModule,
    LoggerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
