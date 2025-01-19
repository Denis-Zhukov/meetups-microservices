import { IsString } from 'class-validator';

export class GetAccessTokenDataDto {
  @IsString()
  token: string;
}
