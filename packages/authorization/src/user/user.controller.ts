import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { UserService } from '@/user/user.service';
import { User } from '@/common/decorators/user.decarator';
import { JwtPayload } from '@/common/types';
import { Response } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AllUsersExistDto } from '@/user/dto/all-users-exist.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @User() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File
  ) {
    await this.userService.setAvatar(user.id, file);

    return { filename: file.filename };
  }

  @UseGuards(JwtAuthGuard)
  @Get('avatar/:filename')
  getAvatar(@Param('filename') filename: string, @Res() res: Response) {
    const fileStream = this.userService.getAvatar(filename);

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `inline; filename="${filename}"`,
    });

    fileStream.pipe(res);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('avatar')
  deleteAvatar(@User() user: JwtPayload) {
    return this.userService.deleteAvatar(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateUser(
    @User() user: JwtPayload,
    @Body() updateUserDto?: UpdateUserDto
  ) {
    await this.userService.updateUser(user.id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  deleteUser(@User() user: JwtPayload) {
    return this.userService.deleteUser(user.id);
  }

  @MessagePattern('all-users-exist')
  allUsersExist(@Payload() data: AllUsersExistDto) {
    return this.userService.allUsersExist(data.users);
  }
}
