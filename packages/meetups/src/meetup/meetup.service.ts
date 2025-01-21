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
import { EXCEPTION_MESSAGES, LOG_MESSAGES } from './meetup.constants';
import { Meetup } from '@prisma/client';

@Injectable()
export class MeetupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly elastic: ElasticsearchService
  ) {}

  public async getMeetupsInRadius({
    latitude,
    longitude,
    radius,
  }: FilterMeetupsDto) {
    try {
      const meetups = await this.prisma.$queryRaw`
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

      this.logger.log(
        LOG_MESSAGES.getMeetupsInRadiusSuccess(latitude, longitude, radius)
      );

      return meetups;
    } catch (error) {
      this.logger.error(
        LOG_MESSAGES.getMeetupsInRadiusError(latitude, longitude, radius),
        error.stack
      );
      throw new InternalServerErrorException(
        EXCEPTION_MESSAGES.getMeetupsInRadiusError
      );
    }
  }

  public async getMeetupByText(text: string) {
    try {
      const meetups = await this.elastic.searchMeetups(text);

      this.logger.log(LOG_MESSAGES.searchMeetupsSuccess(text));

      return meetups;
    } catch (error) {
      this.logger.error(LOG_MESSAGES.searchMeetupsError(text), error.stack);
      throw new InternalServerErrorException(
        EXCEPTION_MESSAGES.searchMeetupsError
      );
    }
  }

  public async getMeetupById(id: string) {
    let meetup: Meetup | null;

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

      this.logger.log(LOG_MESSAGES.meetupFetchSuccess(id));
    } catch (error) {
      this.logger.error(LOG_MESSAGES.meetupFetchError(id), error.stack);
      throw new NotFoundException(EXCEPTION_MESSAGES.meetupNotFound(id));
    }

    if (!meetup) {
      this.logger.warn(LOG_MESSAGES.meetupNotFound(id));
      throw new NotFoundException(EXCEPTION_MESSAGES.meetupNotFound(id));
    }

    return meetup;
  }

  public async getMeetupsWithPagination(
    userId: string,
    skip: number,
    take: number
  ) {
    try {
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

      this.logger.log(LOG_MESSAGES.meetupsFetchSuccess(userId, skip, take));

      return {
        meetups,
        totalCount,
      };
    } catch (error) {
      this.logger.error(
        LOG_MESSAGES.meetupsFetchError(userId, skip, take),
        error.stack
      );
      throw new InternalServerErrorException(
        EXCEPTION_MESSAGES.meetupsFetchError
      );
    }
  }

  public async addMeetup(
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

      this.logger.log(LOG_MESSAGES.meetupCreated(meetup.id));

      if (location) {
        await this.prisma.$queryRaw`
                      UPDATE "meetups"
                      SET "location" = ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326)
                      WHERE "id" = ${meetup.id}
                `;
      }

      await this.elastic.indexMeetup(meetup);
      this.logger.log(LOG_MESSAGES.meetupIndexingSuccess(meetup.id));

      return meetup;
    } catch (error) {
      this.logger.error(LOG_MESSAGES.meetupCreationError, error.stack);
      throw new InternalServerErrorException(
        EXCEPTION_MESSAGES.meetupCreationError
      );
    }
  }

  public async updateMeetup(
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

      this.logger.log(LOG_MESSAGES.meetupUpdated(meetupId, userId));
    } catch (error) {
      if (error.code === 'P2025') {
        this.logger.warn(LOG_MESSAGES.meetupNotFound(meetupId));
        throw new NotFoundException(
          EXCEPTION_MESSAGES.meetupNotFound(meetupId)
        );
      }

      this.logger.error(
        LOG_MESSAGES.meetupUpdateError(meetupId, userId),
        error.stack
      );
      throw new InternalServerErrorException(
        EXCEPTION_MESSAGES.meetupUpdateError
      );
    }
  }

  public async deleteMeetup(userId: string, meetupId: string) {
    try {
      const result = await this.prisma.meetup.delete({
        where: { id: meetupId, creatorId: userId },
      });

      this.logger.log(LOG_MESSAGES.meetupDeleted(meetupId, userId));

      return result;
    } catch (error) {
      if (error.code === 'P2025') {
        this.logger.warn(LOG_MESSAGES.meetupNotFound(meetupId));
        throw new NotFoundException(
          EXCEPTION_MESSAGES.meetupNotFound(meetupId)
        );
      }
      this.logger.error(
        LOG_MESSAGES.meetupDeleteError(meetupId, userId),
        error.stack
      );
      throw new NotFoundException(EXCEPTION_MESSAGES.meetupNotFound(meetupId));
    }
  }
}
