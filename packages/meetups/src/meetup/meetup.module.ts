import { Module } from '@nestjs/common';
import { MeetupController } from './meetup.controller';
import { MeetupService } from './meetup.service';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [MeetupController],
  providers: [
    MeetupService,
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
  ],
})
export class MeetupModule {}
