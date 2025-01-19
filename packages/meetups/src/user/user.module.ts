import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaClient } from '@prisma/client';
import { UserController } from './user.controller';
import { LoggerModule } from '@/logger/logger.module';

@Module({
  providers: [
    UserService,
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
  ],
  controllers: [UserController],
  imports: [LoggerModule],
})
export class UserModule {}
