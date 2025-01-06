import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ProfileService } from '@/profile/profile.service';
import { User } from '@/common/decorators/user.decarator';
import { JwtPayload } from '@/common/types';
import { Response } from 'express';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @User() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File
  ) {
    await this.profileService.setAvatar(user.id, file);

    return { filename: file.filename };
  }

  @UseGuards(JwtAuthGuard)
  @Get('avatar/:filename')
  async getAvatar(@Param('filename') filename: string, @Res() res: Response) {
    const fileStream = this.profileService.getAvatar(filename);

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `inline; filename="${filename}"`,
    });

    fileStream.pipe(res);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('avatar')
  async deleteAvatar(@User() user: JwtPayload) {
    await this.profileService.deleteAvatar(user.id);
  }
}
