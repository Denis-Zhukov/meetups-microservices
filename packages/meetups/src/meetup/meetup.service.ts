import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AddMeetupDto } from '@/meetup/dto/add-meetup.dto';
import { UpdateMeetupDto } from '@/meetup/dto/update-meetup.dto';
import { LoggerService } from '@/logger/logger.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ElasticsearchService } from '@/elasticsearch/elasticsearch.service';
import { FilterMeetupsDto } from '@/meetup/dto/filter-meetups.dto';

@Injectable()
export class MeetupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly elastic: ElasticsearchService
  ) {}

  async getMeetupsInRadius({ latitude, longitude, radius }: FilterMeetupsDto) {
    try {
      return await this.prisma.$queryRaw`
              SELECT 
                id, creator_id, name, description, tags, place, start, "end", 
                created_at AS "createdAt",
                updated_at AS "updatedAt",
                creator_id AS "creatorId",
                ST_X(location::geometry) AS longitude,  
                ST_Y(location::geometry) AS latitude
              FROM "meetups"
              WHERE ST_DWithin(
                location::geography, 
                ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, 
                ${radius}
              )
            `;
    } catch {
      throw new InternalServerErrorException(
        'Error fetching meetups in radius'
      );
    }
  }

  public async getMeetupByText(text: string) {
    return this.elastic.searchMeetups(text);
  }

  public async getMeetupById(id: string) {
    let meetup;

    try {
      meetup = await this.prisma.$queryRaw`
            SELECT
                id, creator_id, name, description, tags, place, start, "end",
                created_at AS "createdAt",
                updated_at AS "updatedAt",
                creator_id AS "creatorId",
                ST_X(location::geometry) AS longitude,  
                ST_Y(location::geometry) AS latitude
            FROM meetups
            WHERE id = ${id}`;
    } catch (error) {
      this.logger.error(`Error fetching meetup with ID ${id}`, error.stack);
      throw new NotFoundException(`Meetup with ID ${id} not found`);
    }

    if (!meetup) {
      this.logger.warn(`Meetup with ID ${id} not found`);
      throw new NotFoundException(`Meetup with ID ${id} not found`);
    }

    return meetup;
  }

  async getMeetupsWithPagination(userId: string, skip: number, take: number) {
    const meetups = await this.prisma.$queryRaw`
              SELECT 
                id, creator_id, name, description, tags, place, start, "end",
                created_at AS "createdAt",
                updated_at AS "updatedAt",
                creator_id AS "creatorId",
                ST_X(location::geometry) AS longitude,  
                ST_Y(location::geometry) AS latitude
              FROM meetups
              WHERE creator_id = ${userId}
              LIMIT ${take} OFFSET ${skip};
        `;

    const totalCount = await this.prisma.meetup.count();

    return {
      meetups,
      totalCount,
    };
  }

  async addMeetup(
    creatorId: string,
    { name, description, tags, place, start, end, location }: AddMeetupDto
  ) {
    try {
      const meetup = await this.prisma.meetup.create({
        data: {
          creatorId,
          name,
          description,
          tags,
          place,
          start,
          end,
        },
      });

      if (location) {
        await this.prisma.$queryRaw`
                  UPDATE "meetups"
                  SET "location" = ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326)
                  WHERE "id" = ${meetup.id}
                `;
      }

      await this.elastic.indexMeetup(meetup);

      return meetup;
    } catch (error) {
      this.logger.error('Error adding new meetup', error.stack);
      throw new InternalServerErrorException('Error adding meetup');
    }
  }

  async updateMeetup(
    userId: string,
    meetupId: string,
    { name, description, tags, place, start, end, location }: UpdateMeetupDto
  ) {
    try {
      await this.prisma.meetup.update({
        where: { id: meetupId, creatorId: userId },
        data: {
          name,
          description,
          tags,
          place,
          start,
          end,
        },
      });

      if (location) {
        await this.prisma.$queryRaw`
                  UPDATE "meetups"
                  SET "location" = ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326)
                  WHERE "id" = ${meetupId}
                `;
      }
    } catch (error) {
      if (error.code === 'P2025') {
        this.logger.warn(
          `Meetup with ID ${meetupId} not found for user ${userId}`
        );
        throw new NotFoundException(`Meetup with ID ${meetupId} not found`);
      }
      this.logger.error(
        `Error updating meetup with ID ${meetupId} for user ${userId}`,
        error.stack
      );
      throw error;
    }
  }

  async deleteMeetup(userId: string, meetupId: string) {
    try {
      const result = await this.prisma.meetup.delete({
        where: { id: meetupId, creatorId: userId },
      });

      this.logger.log(
        `Meetup with ID ${meetupId} has been deleted by user ${userId}`
      );

      return result;
    } catch (error) {
      if (error.code === 'P2025') {
        this.logger.warn(
          `Meetup with ID ${meetupId} not found for user ${userId}`
        );
        throw new NotFoundException(`Meetup with ID ${meetupId} not found`);
      }
      this.logger.error(
        `Error deleting meetup with ID ${meetupId} for user ${userId}`,
        error.stack
      );
      throw new NotFoundException(`Meetup with ID ${meetupId} not found`);
    }
  }
}
