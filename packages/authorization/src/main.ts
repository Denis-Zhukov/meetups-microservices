import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@/common/types';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const cfgService = app.get(ConfigService<EnvConfig>);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [cfgService.get<string>('RABBITMQ_HOST')],
      queue: 'auth_queue',
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
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
