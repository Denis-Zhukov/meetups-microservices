import {
  Injectable,
  Logger,
  InternalServerErrorException,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { RMQ_AUTH } from '@/app.constants';
import { lastValueFrom } from 'rxjs';
import { InvitationStatus } from '@prisma/client';

@Injectable()
export class InvitationService {
  private readonly logger = new Logger(InvitationService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(RMQ_AUTH) private readonly rmqAuth: ClientProxy
  ) {}

  private userExists(users: string[]) {
    return lastValueFrom<boolean>(
      this.rmqAuth.send('all-users-exist', { users })
    );
  }

  public async addUsersToMeetup(
    creatorId: string,
    meetupId: string,
    users: string[]
  ) {
    const meetup = await this.prisma.meetup.findUnique({
      where: { id: meetupId },
    });

    if (!meetup) {
      throw new NotFoundException(`Meetup with ID ${meetupId} not found`);
    }

    if (meetup.creatorId !== creatorId) {
      throw new ForbiddenException(`You are not the creator of this meetup`);
    }

    const usersExist = await this.userExists(users);

    if (!usersExist)
      throw new BadRequestException(`One or more users do not exist`);

    const invitations = users.map((userId) => ({
      meetupId,
      userId,
    }));

    await this.prisma.invitee.createMany({
      data: invitations,
      skipDuplicates: true,
    });

    return { message: 'Users successfully added to meetup' };
  }

  public async removeUsersFromMeetup(meetupId: string, userIds: string[]) {
    try {
      const deletedCount = await this.prisma.invitee.deleteMany({
        where: {
          meetupId,
          userId: { in: userIds },
        },
      });

      if (deletedCount.count === 0) {
        this.logger.warn(`No users were removed from meetup ${meetupId}`);
      }

      return { message: `${deletedCount.count} users removed from meetup` };
    } catch (error) {
      this.logger.error(
        `Error removing users from meetup ${meetupId}`,
        error.stack
      );
      throw new InternalServerErrorException(
        `Failed to remove users from meetup`
      );
    }
  }

  public async acceptInvitation(userId: string, meetupId: string) {
    const invitee = await this.prisma.invitee.findUnique({
      where: {
        userId_meetupId: { userId, meetupId },
      },
    });

    if (!invitee) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitee.status === InvitationStatus.ACCEPTED) {
      throw new ForbiddenException('Invitation already accepted');
    }

    return this.prisma.invitee.update({
      where: {
        userId_meetupId: { userId, meetupId },
      },
      data: {
        status: InvitationStatus.ACCEPTED,
      },
    });
  }

  async declineInvitation(userId: string, meetupId: string) {
    const invitee = await this.prisma.invitee.findUnique({
      where: {
        userId_meetupId: { userId, meetupId },
      },
    });

    if (!invitee) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitee.status === InvitationStatus.DECLINED) {
      throw new ForbiddenException('Invitation already declined');
    }

    return this.prisma.invitee.update({
      where: {
        userId_meetupId: { userId, meetupId },
      },
      data: {
        status: InvitationStatus.DECLINED,
      },
    });
  }
}
