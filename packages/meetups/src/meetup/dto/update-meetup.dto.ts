import {
  IsOptional,
  IsString,
  IsDate,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMeetupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  place?: string;

  @Type(() => Date)
  @IsOptional()
  @IsDate()
  start?: Date;

  @Type(() => Date)
  @IsOptional()
  @IsDate()
  end?: Date;
}
