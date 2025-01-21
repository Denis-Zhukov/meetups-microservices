import { IsArray, IsString } from 'class-validator';

export class AddUsersToMeetupDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}
