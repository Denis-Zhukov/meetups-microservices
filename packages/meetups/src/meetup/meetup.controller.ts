import { Body, Controller, Post } from '@nestjs/common';
import { AddMeetupDto } from '@/meetup/dto/add-meetup.dto';
import { MeetupService } from '@/meetup/meetup.service';

@Controller('meetup')
export class MeetupController {
  constructor(private readonly meetupService: MeetupService) {}

  @Post()
  async addMeetup(@Body() data: AddMeetupDto) {
    return await this.meetupService.addMeetup('1', data);
  }
}
