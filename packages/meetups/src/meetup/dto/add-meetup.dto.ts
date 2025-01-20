import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddMeetupDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags: string[];

  @IsString()
  place: string;

  @Type(() => Date)
  @IsDate()
  start: Date;

  @Type(() => Date)
  @IsDate()
  end: Date;

  @IsOptional()
  @IsObject()
  location?: { latitude: number; longitude: number };
}
