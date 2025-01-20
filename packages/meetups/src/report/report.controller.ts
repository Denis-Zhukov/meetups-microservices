import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { Response } from 'express';
import { AuthGuard } from '@/common/guards/rabbitmq-auth.guard';

@UseGuards(AuthGuard)
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('csv')
  async getCsvReport(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="available_meetups.csv"'
    );

    await this.reportService.generateCsvStream(res);
  }

  @Get('pdf')
  async getPdfReport(@Res() res: Response) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="available_meetups.pdf"'
    );

    await this.reportService.generatePdfStream(res);
  }
}
