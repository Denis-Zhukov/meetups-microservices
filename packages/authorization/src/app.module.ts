import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { EnvConfig } from '../types';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: (config: EnvConfig) => ({
        ...config,
        ACCESS_JWT_EXPIRE_IN: Number(config['ACCESS_JWT_EXPIRE_IN']),
        REFRESH_JWT_EXPIRE_IN: Number(config['REFRESH_JWT_EXPIRE_IN']),
      }),
    }),
    AuthModule,
    LoggerModule,
  ],
  controllers: [],
})
export class AppModule {}
