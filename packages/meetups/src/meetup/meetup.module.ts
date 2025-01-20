import { Module } from '@nestjs/common';
import { MeetupController } from './meetup.controller';
import { MeetupService } from './meetup.service';
import { LoggerModule } from '@/logger/logger.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  controllers: [MeetupController],
  providers: [MeetupService],
  imports: [PrismaModule, LoggerModule],
})
export class MeetupModule {}
