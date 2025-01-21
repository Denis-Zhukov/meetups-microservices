import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@/common/types';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const cfgService = app.get(ConfigService<EnvConfig>);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [cfgService.getOrThrow<string>('RABBITMQ_HOST')],
      queue: cfgService.getOrThrow<string>('MEETUP_QUEUE'),
      queueOptions: {
        durable: true,
      },
    },
  });

  app.enableCors({
    origin: '*',
    credentials: true,
  });
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.startAllMicroservices();
  await app.listen(cfgService.get<string>('PORT') ?? 3001);
}

bootstrap();
