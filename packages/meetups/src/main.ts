import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@/common/types';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const cfgService = app.get(ConfigService<EnvConfig>);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [cfgService.get<string>('RABBITMQ_HOST')],
      queue: 'meetup_queue',
      queueOptions: {
        durable: true,
      },
    },
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
