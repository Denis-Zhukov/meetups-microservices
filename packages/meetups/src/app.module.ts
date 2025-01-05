import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvVars: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
