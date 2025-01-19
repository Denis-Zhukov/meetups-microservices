import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { MeetupModule } from './meetup/meetup.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RMQ_AUTH } from '@/app.constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    MeetupModule,
    ClientsModule.registerAsync({
      isGlobal: true,
      clients: [
        {
          name: RMQ_AUTH,
          useFactory: (cfgService) => ({
            transport: Transport.RMQ,
            options: {
              urls: [cfgService.getOrThrow('RABBITMQ_HOST')],
              queue: 'auth_queue',
              queueOptions: {
                durable: true,
              },
            },
          }),
          inject: [ConfigService],
        },
      ],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
