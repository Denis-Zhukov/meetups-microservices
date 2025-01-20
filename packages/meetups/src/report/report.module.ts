import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  providers: [ReportService],
  controllers: [ReportController],
  imports: [PrismaModule],
})
export class ReportModule {}
