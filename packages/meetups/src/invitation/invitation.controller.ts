import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { AddUsersToMeetupDto } from './dto/add-users-to-meetup.dto';
import { RemoveUsersFromMeetupDto } from './dto/remove-users-from-meetup.dto';
import { AuthGuard } from '@/common/guards/auth.guard';
import { User } from '@/common/decorators/user.decorator';
import { UserPayload } from '@/common/types';

@UseGuards(AuthGuard)
@Controller('invitation')
export class InvitationController {
  constructor(private readonly service: InvitationService) {}

  @Post(':id/invite')
  addUsersToMeetup(
    @User() user: UserPayload,
    @Param('id') meetupId: string,
    @Body() { userIds }: AddUsersToMeetupDto
  ) {
    return this.service.addUsersToMeetup(user.id, meetupId, userIds);
  }

  @Post(':id/remove-invitees')
  async removeUsersFromMeetup(
    @User() user: UserPayload,
    @Param('id') meetupId: string,
    @Body() { userIds }: RemoveUsersFromMeetupDto
  ) {
    return this.service.removeUsersFromMeetup(user.id, meetupId, userIds);
  }

  @Patch(':meetupId/accept')
  async acceptInvitation(
    @User() user: UserPayload,
    @Param('meetupId') meetupId: string
  ) {
    return this.service.acceptInvitation(user.id, meetupId);
  }

  @Patch(':meetupId/decline')
  async declineInvitation(
    @User() user: UserPayload,
    @Param('meetupId') meetupId: string
  ) {
    return this.service.declineInvitation(user.id, meetupId);
  }
}
