import { Controller } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DeleteUserDto } from '@/user/dto/delete-user.dto';
import { RMQ_PATTERNS } from '@/user/user.constants';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern(RMQ_PATTERNS.deleteUser)
  async deleteUser(@Payload() { userId }: DeleteUserDto) {
    await this.userService.deleteUser(userId);
  }
}
