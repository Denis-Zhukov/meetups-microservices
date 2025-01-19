import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoggerService } from '@/logger/logger.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly logger: LoggerService
  ) {}

  async deleteUser(userId: string) {
    await this.prisma.invitee.deleteMany({ where: { userId } });
    await this.prisma.meetup.deleteMany({ where: { creatorId: userId } });
    this.logger.log(
      `Meetups and invitees for user deleted: ${JSON.stringify(this.prisma)}`
    );
  }
}
