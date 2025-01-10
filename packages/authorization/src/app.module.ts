import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './logger/logger.module';
import { UserModule } from './profile/user.module';
import { MailerModule } from './mailer/mailer.module';
import * as parseDotenv from 'dotenv-parse-variables';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => parseDotenv(config),
    }),
    AuthModule,
    LoggerModule,
    UserModule,
    MailerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
