import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ProfileService } from './profile.service';
import { PrismaClient } from '@prisma/client';
import {
  ALLOWED_EXTENSIONS,
  IMAGE_MIME_TYPES,
  IMAGES_DIR,
  MAX_FILENAME_LENGTH,
  MAX_IMAGE_SIZE,
} from './profile.constants';
import { LoggerModule } from '@/logger/logger.module';
import { WrongMimeTypeException } from '@/exceptions/wrong-mime-type.exception';
import { generateFilename } from '@/common/utils/generate-filename';

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
          cb(new WrongMimeTypeException(ALLOWED_EXTENSIONS), false);
        } else {
          cb(null, true);
        }
      },
      limits: {
        fileSize: MAX_IMAGE_SIZE,
      },
    }),
    LoggerModule,
  ],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
  ],
})
export class ProfileModule {}
