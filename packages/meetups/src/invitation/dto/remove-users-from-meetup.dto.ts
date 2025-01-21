import { IsArray, IsString } from 'class-validator';

export class RemoveUsersFromMeetupDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}
