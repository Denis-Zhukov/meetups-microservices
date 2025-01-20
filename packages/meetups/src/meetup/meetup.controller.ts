import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AddMeetupDto } from '@/meetup/dto/add-meetup.dto';
import { MeetupService } from '@/meetup/meetup.service';
import { User } from '@/common/decorators/user.decorator';
import { AuthGuard } from '@/common/guards/rabbitmq-auth.guard';
import { UpdateMeetupDto } from '@/meetup/dto/update-meetup.dto';
import { PositiveIntPipe } from '@/common/pipes/positive-nubmer.pipe';
import { FilterMeetupsDto } from '@/meetup/dto/filter-meetups.dto';

@UseGuards(AuthGuard)
@Controller('meetup')
export class MeetupController {
  constructor(private readonly meetupService: MeetupService) {}

  @Get('radius')
  async getMeetupsInRadius(@Query() filter: FilterMeetupsDto) {
    return this.meetupService.getMeetupsInRadius(filter);
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return this.meetupService.getMeetupByText(query);
  }

  @Get('/:id')
  getMeetup(@Param('id') id: string) {
    return this.meetupService.getMeetupById(id);
  }

  @Get()
  getMeetups(
    @User() user,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe, PositiveIntPipe)
    skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe, PositiveIntPipe)
    take: number
  ) {
    return this.meetupService.getMeetupsWithPagination(user.id, skip, take);
  }

  @Post()
  async addMeetup(@User() user, @Body() data: AddMeetupDto) {
    return await this.meetupService.addMeetup(user.id, data);
  }

  @Patch('/:id')
  async updateMeetup(
    @User() user,
    @Param('id') meetupId: string,
    @Body() data: UpdateMeetupDto
  ) {
    return await this.meetupService.updateMeetup(user.id, meetupId, data);
  }

  @Delete('/:id')
  async deleteMeetup(@User() user, @Param('id') meetupId: string) {
    return await this.meetupService.deleteMeetup(user.id, meetupId);
  }
}
