import { IsLatitude, IsLongitude, IsOptional, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterMeetupsDto {
  @IsLatitude()
  @Transform(({ value }) => parseFloat(value))
  latitude: number;

  @IsLongitude()
  @Transform(({ value }) => parseFloat(value))
  longitude: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  radius: number = 100;
}
