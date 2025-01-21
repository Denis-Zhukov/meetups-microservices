import { BadRequestException, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  EXCEPTION_ERRORS,
  IMAGE_MIME_TYPES,
  IMAGES_DIR,
  MAX_FILENAME_LENGTH,
  MAX_IMAGE_SIZE,
  RMQ_MEETUP,
} from './user.constants';
import { generateFilename } from '@/common/utils/generate-filename';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@/user/user.service';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: IMAGES_DIR,
        filename: async (_, file, callback) => {
          const filename = generateFilename(file, MAX_FILENAME_LENGTH);
          callback(null, filename);
        },
      }),
      fileFilter: (_, file, cb) => {
        if (!IMAGE_MIME_TYPES.includes(file.mimetype)) {
          cb(new BadRequestException(EXCEPTION_ERRORS.wrongMimeType), false);
        } else {
          cb(null, true);
        }
      },
      limits: {
        fileSize: MAX_IMAGE_SIZE,
      },
    }),
    ClientsModule.registerAsync([
      {
        name: RMQ_MEETUP,
        useFactory: (cfgService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [cfgService.getOrThrow('RABBITMQ_HOST')],
            queue: cfgService.getOrThrow('MEETUP_QUEUE'),
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
