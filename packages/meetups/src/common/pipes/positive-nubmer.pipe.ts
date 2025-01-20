import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class PositiveIntPipe implements PipeTransform<number, number> {
  transform(value: number): number {
    if (value < 0) {
      throw new BadRequestException('Value must be a positive integer');
    }
    return value;
  }
}
