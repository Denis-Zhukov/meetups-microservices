import { Module } from '@nestjs/common';
import { MeetupController } from './meetup.controller';
import { MeetupService } from './meetup.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { ElasticsearchModule } from '@/elasticsearch/elasticsearch.module';

@Module({
  controllers: [MeetupController],
  providers: [MeetupService],
  imports: [PrismaModule, ElasticsearchModule],
})
export class MeetupModule {}
