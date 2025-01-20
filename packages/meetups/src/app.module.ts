import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { MeetupModule } from './meetup/meetup.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RMQ_AUTH } from '@/app.constants';
import { InvitationModule } from './invitation/invitation.module';
import { ReportModule } from './report/report.module';
import { PrismaModule } from './prisma/prisma.module';
import { ElasticsearchModule } from './elasticsearch/elasticsearch.module';

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
    InvitationModule,
    ReportModule,
    PrismaModule,
    ElasticsearchModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
