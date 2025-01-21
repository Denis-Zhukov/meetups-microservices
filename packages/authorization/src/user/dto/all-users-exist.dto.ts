import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AllUsersExistDto {
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  users: string[];
}
