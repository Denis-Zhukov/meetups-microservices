import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Writable } from 'stream';
import { createObjectCsvStringifier } from 'csv-writer';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { format } from 'date-fns';
import { Meetup } from '@prisma/client';
import { LoggerService } from '@/logger/logger.service';
import {
  LOG_MESSAGES,
  EXCEPTION_MESSAGES,
  FORMAT_DATETIME,
  FONT_PATH,
} from './report.constants';

@Injectable()
export class ReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService
  ) {}

  private async getAvailableMeetups() {
    const now = new Date();

    try {
      const meetups = await this.prisma.$queryRaw<
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
            WHERE start >= ${now} OR "end" >= ${now}
        `;

      this.logger.log(LOG_MESSAGES.meetupsFetched);

      return meetups;
    } catch (error) {
      this.logger.error(LOG_MESSAGES.meetupsFetchError, error.stack);
      throw new InternalServerErrorException(
        EXCEPTION_MESSAGES.meetupsFetchError
      );
    }
  }

  private formatDate(date: Date): string {
    return format(date, FORMAT_DATETIME);
  }

  public async generateCsvStream(outputStream: Writable) {
    try {
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

      this.logger.log(LOG_MESSAGES.csvGenerationStarted);

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

      this.logger.log(LOG_MESSAGES.csvGenerationSuccess);
    } catch (error) {
      this.logger.error(LOG_MESSAGES.csvGenerationError, error.stack);
      throw new InternalServerErrorException(
        EXCEPTION_MESSAGES.csvGenerationError
      );
    }
  }

  public async generatePdfStream(outputStream: Writable): Promise<void> {
    const doc = new PDFDocument();

    try {
      this.logger.log(LOG_MESSAGES.pdfGenerationStarted);

      if (!fs.existsSync(FONT_PATH)) {
        this.logger.error(LOG_MESSAGES.fontNotFoundError, null);
        throw new InternalServerErrorException(
          EXCEPTION_MESSAGES.fontNotFoundError
        );
      }

      doc.registerFont('Roboto', FONT_PATH);
      doc.pipe(outputStream);

      doc
        .font('Roboto')
        .fontSize(20)
        .text('Available meetups', { align: 'center' })
        .moveDown();

      const meetups = await this.getAvailableMeetups();
      meetups.forEach((meetup) => {
        doc.fontSize(12).text(`Name: ${meetup.name}`);
        doc.text(`Describe: ${meetup.description}`);
        doc.text(`Place: ${meetup.place}`);
        doc.text(`Start: ${this.formatDate(meetup.start)}`);
        doc.text(`End: ${this.formatDate(meetup.end)}`);
        if (meetup.longitude && meetup.latitude) {
          doc.text(`Longitude: ${meetup.longitude}`);
          doc.text(`Latitude: ${meetup.latitude}`);
        }
        doc.moveDown();
      });

      doc.end();

      this.logger.log(LOG_MESSAGES.pdfGenerationSuccess);
    } catch (error) {
      if (!(error instanceof HttpException)) {
        this.logger.error(LOG_MESSAGES.pdfGenerationError, error.stack);
      }
      throw new InternalServerErrorException(
        EXCEPTION_MESSAGES.pdfGenerationError
      );
    }
  }
}
