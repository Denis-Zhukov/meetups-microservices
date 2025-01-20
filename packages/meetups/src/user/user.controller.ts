import { Controller } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DeleteUserDto } from '@/user/dto/delete-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('delete_user')
  async deleteUser(@Payload() { userId }: DeleteUserDto) {
    await this.userService.deleteUser(userId);
  }
}
