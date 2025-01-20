import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InvitationService } from '@/invitation/invitation.service';
import { AddUsersToMeetupDto } from './dto/add-users-to-meetup.dto';
import { RemoveUsersFromMeetupDto } from '@/invitation/dto/remove-users-from-meetup.dto';
import { AuthGuard } from '@/common/guards/rabbitmq-auth.guard';
import { User } from '@/common/decorators/user.decorator';

@UseGuards(AuthGuard)
@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post(':id/invite')
  async addUsersToMeetup(
    @User() user,
    @Param('id') meetupId: string,
    @Body() { userIds }: AddUsersToMeetupDto
  ) {
    await this.invitationService.addUsersToMeetup(user.id, meetupId, userIds);
    return { message: 'Users added to meetup successfully' };
  }

  @Post(':id/remove-invitees')
  async removeUsersFromMeetup(
    @Param('id') meetupId: string,
    @Body() { userIds }: RemoveUsersFromMeetupDto
  ) {
    return this.invitationService.removeUsersFromMeetup(meetupId, userIds);
  }

  @Patch(':meetupId/accept')
  async acceptInvitation(@User() user, @Param('meetupId') meetupId: string) {
    return this.invitationService.acceptInvitation(user.id, meetupId);
  }

  @Patch(':meetupId/decline')
  async declineInvitation(@User() user, @Param('meetupId') meetupId: string) {
    return this.invitationService.declineInvitation(user.id, meetupId);
  }
}
