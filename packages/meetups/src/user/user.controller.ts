import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DeleteUserDto } from '@/user/dto/delete-user.dto';
import { AuthGuard } from '@/common/decorators/rabbitmq-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get()
  test() {
    return 'test';
  }

  @MessagePattern('delete_user')
  async deleteUser(@Payload() { userId }: DeleteUserDto) {
    await this.userService.deleteUser(userId);
  }
}
