import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AddMeetupDto } from '@/meetup/dto/add-meetup.dto';

@Injectable()
export class MeetupService {
  constructor(private readonly prisma: PrismaClient) {}

  async addMeetup(
    creatorId: string,
    { name, description, tags, place, start, end }: AddMeetupDto
  ) {
    return this.prisma.meetup.create({
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
  }
}
