import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { createReadStream, existsSync } from 'fs';
import {
  EXCEPTION_ERRORS,
  IMAGES_DIR,
  LOG_MESSAGES,
  RMQ_MEETUP,
  RMQ_REMOVE_MEETUPS_OF_THIS_USER,
} from './user.constants';
import { LoggerService } from '@/logger/logger.service';
import { UpdateUserDto } from '@/user/dto/update-user.dto';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    @Inject(RMQ_MEETUP) private readonly rmqMeetup: ClientProxy
  ) {}

  private async deleteAvatarFile(id: string, avatar: string) {
    const avatarPath = join(IMAGES_DIR, avatar);

    if (existsSync(avatarPath)) {
      try {
        await unlink(avatarPath);
        this.logger.log(LOG_MESSAGES.avatarDeleted(id, avatar));
      } catch (error) {
        this.logger.error(LOG_MESSAGES.avatarDeleteFailed(id), error.stack);
        throw error;
      }
    } else {
      this.logger.warn(LOG_MESSAGES.avatarNotFoundForDelete(id));
      throw new NotFoundException(EXCEPTION_ERRORS.fileNotFound);
    }
  }

  async setAvatar(id: string, file: Express.Multer.File) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: { avatar: true },
      });

      if (!user) throw new NotFoundException(EXCEPTION_ERRORS.userNotFound);

      if (user.avatar) await this.deleteAvatarFile(id, user.avatar);

      await this.prisma.user.update({
        where: { id },
        data: { avatar: file.filename },
      });

      this.logger.log(LOG_MESSAGES.avatarUpdated(id, file.filename));
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.logger.error(LOG_MESSAGES.userUpdateFailed(id), error.stack);
      }
      this.logger.error(
        LOG_MESSAGES.avatarUpdateFailed(id, file.filename),
        error.stack
      );
      throw error;
    }
  }

  getAvatar(filename: string) {
    const filePath = join(IMAGES_DIR, filename);

    if (!existsSync(filePath)) {
      this.logger.warn(LOG_MESSAGES.avatarNotFound(filePath));
      throw new NotFoundException(EXCEPTION_ERRORS.fileNotFound);
    }

    try {
      const fileStream = createReadStream(filePath);

      fileStream.on('error', (error) => {
        this.logger.error(LOG_MESSAGES.avatarReadError(filePath), error.stack);
        throw new InternalServerErrorException(
          EXCEPTION_ERRORS.fileReadingError
        );
      });

      return fileStream;
    } catch (error) {
      this.logger.error(
        LOG_MESSAGES.unexpectedFetchingAvatar(filePath),
        error.stack
      );
      throw error;
    }
  }

  async deleteAvatar(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: { avatar: true },
      });

      if (!user) throw new NotFoundException(EXCEPTION_ERRORS.userNotFound);

      if (!user.avatar) {
        this.logger.warn(LOG_MESSAGES.avatarNotFoundForDelete(id));
        throw new NotFoundException(EXCEPTION_ERRORS.fileNotFound);
      }

      await this.deleteAvatarFile(id, user.avatar);

      await this.prisma.user.update({
        where: { id },
        data: { avatar: null },
      });
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.logger.error(LOG_MESSAGES.avatarDeleteFailed(id), error.stack);
      }
      throw error;
    }
  }

  async updateUser(id: string, { name, surname }: UpdateUserDto) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) throw new NotFoundException(EXCEPTION_ERRORS.userNotFound);

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          name: name ?? user.name,
          surname: surname ?? user.surname,
        },
      });

      this.logger.log(LOG_MESSAGES.userUpdated(id));

      return updatedUser;
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.logger.error(LOG_MESSAGES.userUpdateFailed(id), error.stack);
      }
      throw error;
    }
  }

  async deleteUser(id: string) {
    try {
      const deletedUser = await this.prisma.user.delete({ where: { id } });
      this.rmqMeetup.emit(RMQ_REMOVE_MEETUPS_OF_THIS_USER, {
        userId: deletedUser.id,
      });
      this.logger.log(LOG_MESSAGES.userDeleted(id));
      return deletedUser;
    } catch (error) {
      if (error.code === 'P2025') {
        this.logger.warn(LOG_MESSAGES.userNotFoundForDelete(id));
        throw new NotFoundException(EXCEPTION_ERRORS.userNotFound);
      }
      this.logger.error(LOG_MESSAGES.userDeleteFailed(id), error.stack);
      throw error;
    }
  }

  async allUsersExist(users: string[]): Promise<boolean> {
    try {
      const usersInDb = await this.prisma.user.findMany({
        where: {
          id: { in: users },
        },
        select: { id: true },
      });
      return usersInDb.length === users?.length;
    } catch (error) {
      this.logger.error(
        LOG_MESSAGES.errorCheckingUsersExist(users),
        error.stack
      );
      throw new InternalServerErrorException('Error checking if users exist');
    }
  }
}
