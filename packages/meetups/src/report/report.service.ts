import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Writable } from 'stream';
import { createObjectCsvStringifier } from 'csv-writer';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Meetup } from '@prisma/client';

@Injectable()
export class ReportService {
  private readonly fontPath = './fonts/Roboto-Regular.ttf';

  constructor(private readonly prisma: PrismaService) {}

  private getAvailableMeetups() {
    return this.prisma.$queryRaw<
      Array<Meetup & { longitude: number; latitude: number }>
    >`
          SELECT 
                id, creator_id, name, description, tags, place, start, "end", 
                created_at AS "createdAt",
                updated_at AS "updatedAt",
                creator_id AS "creatorId",
                ST_X(location::geometry) AS longitude,  
                ST_Y(location::geometry) AS latitude
          FROM meetups
          WHERE start >= ${new Date(1999, 0, 1)}
        `;
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
        { id: 'tags', title: 'Tags' },
        { id: 'place', title: 'Place' },
        { id: 'start', title: 'Start Date' },
        { id: 'end', title: 'End Date' },
        { id: 'longitude', title: 'Longitude' },
        { id: 'latitude', title: 'Latitude' },
      ],
    });

    outputStream.write(csvStringifier.getHeaderString());

    outputStream.write(
      csvStringifier.stringifyRecords(
        meetups.map((meetup) => ({
          name: meetup.name,
          description: meetup.description,
          tags: `[${meetup.tags}]`,
          place: meetup.place,
          start: this.formatDate(meetup.start),
          end: this.formatDate(meetup.end),
          longitude: meetup.longitude,
          latitude: meetup.latitude,
        }))
      )
    );

    outputStream.end();
  }

  public async generatePdfStream(outputStream: Writable): Promise<void> {
    const meetups = await this.getAvailableMeetups();

    const doc = new PDFDocument();

    if (!fs.existsSync(this.fontPath)) {
      throw new Error(
        'Шрифт не найден. Убедитесь, что путь к шрифту указан верно.'
      );
    }
    doc.registerFont('Roboto', this.fontPath);

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
      doc.text(`Долгота: ${meetup.longitude}`);
      doc.text(`Широта: ${meetup.latitude}`);
      doc.moveDown();
    });

    doc.end();
  }
}
