import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { RMQ_AUTH } from '@/app.constants';
import { lastValueFrom } from 'rxjs';
import { InvitationStatus } from '@prisma/client';
import {
  EXCEPTION_MESSAGES,
  LOG_MESSAGES,
  RESPONSES,
  RMQ_CHECK_USERS_EXIST,
} from './invitation.constants';
import { LoggerService } from '@/logger/logger.service';

@Injectable()
export class InvitationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(RMQ_AUTH) private readonly rmqAuth: ClientProxy,
    private readonly logger: LoggerService
  ) {}

  private userExists(users: string[]) {
    return lastValueFrom<boolean>(
      this.rmqAuth.send(RMQ_CHECK_USERS_EXIST, { users })
    );
  }

  public async addUsersToMeetup(
    creatorId: string,
    meetupId: string,
    users: string[]
  ) {
    try {
      const meetup = await this.prisma.meetup.findUnique({
        where: { id: meetupId },
      });

      if (!meetup) {
        this.logger.warn(LOG_MESSAGES.meetupNotFound(meetupId));
        throw new NotFoundException(
          EXCEPTION_MESSAGES.meetupNotFound(meetupId)
        );
      }

      if (meetup.creatorId !== creatorId) {
        this.logger.warn(LOG_MESSAGES.notMeetupCreator(creatorId, meetupId));
        throw new ForbiddenException(
          EXCEPTION_MESSAGES.notMeetupCreator(meetupId)
        );
      }

      const usersExist = await this.userExists(users);

      if (!usersExist) {
        this.logger.warn(LOG_MESSAGES.usersDoNotExist(users));
        throw new BadRequestException(EXCEPTION_MESSAGES.usersDoNotExist());
      }

      const invitations = users.map((userId) => ({
        meetupId,
        userId,
      }));

      const { count } = await this.prisma.invitee.createMany({
        data: invitations,
        skipDuplicates: true,
      });

      this.logger.log(LOG_MESSAGES.usersAddedToMeetup(meetupId, count));

      return { message: RESPONSES.usersAdded(count) };
    } catch (error) {
      if (!(error instanceof HttpException)) {
        this.logger.error(
          LOG_MESSAGES.errorAddingUsersToMeetup(meetupId),
          error.stack
        );
      }
      throw error;
    }
  }

  public async removeUsersFromMeetup(
    userId: string,
    meetupId: string,
    userIds: string[]
  ) {
    try {
      const meetup = await this.prisma.meetup.findUnique({
        where: { id: meetupId },
        select: { creatorId: true },
      });

      if (!meetup) {
        this.logger.warn(LOG_MESSAGES.meetupNotFound(meetupId));
        throw new NotFoundException(EXCEPTION_MESSAGES.meetupNotFound);
      }

      if (meetup.creatorId !== userId) {
        this.logger.warn(LOG_MESSAGES.notCreator(userId, meetupId));
        throw new ForbiddenException(EXCEPTION_MESSAGES.noPermission);
      }

      const { count } = await this.prisma.invitee.deleteMany({
        where: {
          meetupId,
          userId: { in: userIds },
        },
      });

      if (count === 0) {
        this.logger.warn(LOG_MESSAGES.noUsersRemoved(meetupId));
      }

      return { message: RESPONSES.usersRemoved(count) };
    } catch (error) {
      this.logger.error(LOG_MESSAGES.errorRemovingUsers(meetupId), error.stack);
      throw error;
    }
  }

  public async acceptInvitation(userId: string, meetupId: string) {
    try {
      const invitee = await this.prisma.invitee.findUnique({
        where: {
          userId_meetupId: { userId, meetupId },
        },
      });

      if (!invitee) {
        this.logger.warn(LOG_MESSAGES.meetupNotFound(meetupId));
        throw new NotFoundException(
          EXCEPTION_MESSAGES.meetupNotFound(meetupId)
        );
      }

      if (invitee.status === InvitationStatus.ACCEPTED) {
        this.logger.warn(
          LOG_MESSAGES.invitationAlreadyAccepted(userId, meetupId)
        );
        throw new ForbiddenException(
          EXCEPTION_MESSAGES.invitationAlreadyAccepted
        );
      }

      const updatedInvitee = await this.prisma.invitee.update({
        where: {
          userId_meetupId: { userId, meetupId },
        },
        data: {
          status: InvitationStatus.ACCEPTED,
        },
      });

      this.logger.log(LOG_MESSAGES.invitationAccepted(userId, meetupId));
      return updatedInvitee;
    } catch (error) {
      if (!(error instanceof HttpException)) {
        this.logger.error(
          LOG_MESSAGES.errorAcceptingInvitation(userId, meetupId),
          error.stack
        );
      }
      throw error;
    }
  }

  public async declineInvitation(userId: string, meetupId: string) {
    try {
      const invitee = await this.prisma.invitee.findUnique({
        where: {
          userId_meetupId: { userId, meetupId },
        },
      });

      if (!invitee) {
        this.logger.warn(LOG_MESSAGES.invitationDeclined(userId, meetupId));
        throw new NotFoundException(EXCEPTION_MESSAGES.invitationNotFound);
      }

      if (invitee.status === InvitationStatus.DECLINED) {
        this.logger.warn(
          LOG_MESSAGES.invitationAlreadyDeclined(userId, meetupId)
        );
        throw new ForbiddenException(
          EXCEPTION_MESSAGES.invitationAlreadyDeclined
        );
      }

      const updatedInvitee = await this.prisma.invitee.update({
        where: {
          userId_meetupId: { userId, meetupId },
        },
        data: {
          status: InvitationStatus.DECLINED,
        },
      });

      this.logger.log(LOG_MESSAGES.invitationDeclined(userId, meetupId));
      return updatedInvitee;
    } catch (error) {
      this.logger.error(
        LOG_MESSAGES.errorDecliningInvitation(userId, meetupId),
        error.stack
      );
      throw error;
    }
  }
}
