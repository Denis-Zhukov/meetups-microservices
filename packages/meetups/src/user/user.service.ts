import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LoggerService } from '@/logger/logger.service';
import { PrismaService } from '@/prisma/prisma.service';
import { EXCEPTION_MESSAGES, LOG_MESSAGES } from './user.constants';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService
  ) {}

  public async deleteUser(userId: string): Promise<void> {
    try {
      const inviteesDeleted = await this.prisma.invitee.deleteMany({
        where: { userId },
      });
      this.logger.log(
        LOG_MESSAGES.inviteesDeletionSuccess(userId, inviteesDeleted.count)
      );

      const meetupsDeleted = await this.prisma.meetup.deleteMany({
        where: { creatorId: userId },
      });
      this.logger.log(
        LOG_MESSAGES.meetupsDeletionSuccess(userId, meetupsDeleted.count)
      );

      this.logger.log(LOG_MESSAGES.userDeletionSuccess(userId));
    } catch (error) {
      this.logger.error(LOG_MESSAGES.userDeletionError(userId), error.stack);
      throw new InternalServerErrorException(
        EXCEPTION_MESSAGES.userDeletionError
      );
    }
  }
}
