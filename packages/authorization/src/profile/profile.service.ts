import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { createReadStream, existsSync } from 'fs';
import { IMAGES_DIR, LOG_MESSAGES } from '@/profile/profile.constants';
import { FileReadException, FileNotFoundException } from '@/exceptions';
import { LoggerService } from '@/logger/logger.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly logger: LoggerService
  ) {}

  async setAvatar(id: string, file: Express.Multer.File) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (user.avatar) {
        await this.deleteAvatar(id);
      }

      await this.prisma.user.update({
        where: { id },
        data: { avatar: file.filename },
      });

      this.logger.log(LOG_MESSAGES.avatarUpdated(id, file.filename));
    } catch (error) {
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
      throw new FileNotFoundException();
    }

    try {
      const fileStream = createReadStream(filePath);

      fileStream.on('error', (error) => {
        this.logger.error(LOG_MESSAGES.avatarReadError(filePath), error.stack);
        throw new FileReadException();
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
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { avatar: true },
    });

    if (!user || !user.avatar) {
      this.logger.warn(LOG_MESSAGES.avatarNotFoundForDelete(id));
      throw new FileNotFoundException();
    }

    const avatarPath = join(IMAGES_DIR, user.avatar);

    if (existsSync(avatarPath)) {
      try {
        await unlink(avatarPath);
        this.logger.log(LOG_MESSAGES.avatarDeleted(id, user.avatar));
      } catch (error) {
        this.logger.error(
          LOG_MESSAGES.avatarDeleteFailed(id, user.avatar),
          error.stack
        );
        throw error;
      }
    } else {
      this.logger.warn(LOG_MESSAGES.avatarNotFoundForDelete(id));
      throw new FileNotFoundException();
    }

    await this.prisma.user.update({
      where: { id },
      data: { avatar: null },
    });
  }
}
