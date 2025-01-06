import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { EnvConfig } from './common/types';
import { LoggerModule } from './logger/logger.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config: EnvConfig) => ({
        ...config,
        ACCESS_JWT_EXPIRE_IN: Number(config['ACCESS_JWT_EXPIRE_IN']),
        REFRESH_JWT_EXPIRE_IN: Number(config['REFRESH_JWT_EXPIRE_IN']),
      }),
    }),
    AuthModule,
    LoggerModule,
    ProfileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
