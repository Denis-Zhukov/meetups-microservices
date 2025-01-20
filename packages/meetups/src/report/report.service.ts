import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Writable } from 'stream';
import { createObjectCsvStringifier } from 'csv-writer';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  private async getAvailableMeetups() {
    return this.prisma.meetup.findMany({
      where: {
        start: {
          gte: new Date(1990, 0, 5),
        },
      },
    });
  }

  private formatDate(date: Date): string {
    return format(date, 'd MMMM yyyy, HH:mm', { locale: ru });
  }

  public async generateCsvStream(outputStream: Writable) {
    const meetups = await this.getAvailableMeetups();

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'name', title: 'Name' },
        { id: 'description', title: 'Description' },
        { id: 'place', title: 'Place' },
        { id: 'start', title: 'Start Date' },
        { id: 'end', title: 'End Date' },
      ],
    });

    outputStream.write(csvStringifier.getHeaderString());

    outputStream.write(
      csvStringifier.stringifyRecords(
        meetups.map((meetup) => ({
          name: meetup.name,
          description: meetup.description,
          place: meetup.place,
          start: this.formatDate(meetup.start),
          end: this.formatDate(meetup.end),
        }))
      )
    );

    outputStream.end();
  }

  public async generatePdfStream(outputStream: Writable): Promise<void> {
    const meetups = await this.getAvailableMeetups();

    const doc = new PDFDocument();

    // Подключаем кастомный шрифт
    const fontPath = './fonts/Roboto-Regular.ttf';
    if (!fs.existsSync(fontPath)) {
      throw new Error(
        'Шрифт не найден. Убедитесь, что путь к шрифту указан верно.'
      );
    }
    doc.registerFont('Roboto', fontPath);

    doc.pipe(outputStream);

    doc
      .font('Roboto')
      .fontSize(20)
      .text('Доступные митапы', { align: 'center' })
      .moveDown();

    meetups.forEach((meetup, index) => {
      doc.fontSize(12).text(`${index + 1}. ${meetup.name}`);
      doc.text(`Описание: ${meetup.description}`);
      doc.text(`Место: ${meetup.place}`);
      doc.text(`Начало: ${this.formatDate(meetup.start)}`);
      doc.text(`Конец: ${this.formatDate(meetup.end)}`);
      doc.moveDown();
    });

    doc.end();
  }
}
