import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './logger/logger.module';
import { ProfileModule } from './profile/profile.module';
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
    ProfileModule,
    MailerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
