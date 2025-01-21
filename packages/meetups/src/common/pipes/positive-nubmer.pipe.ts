import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { EXCEPTION_ERRORS } from './pipes.constants';

@Injectable()
export class PositiveIntPipe implements PipeTransform<number, number> {
  transform(value: number): number {
    if (value < 0) {
      throw new BadRequestException(EXCEPTION_ERRORS.mustBePositive);
    }
    return value;
  }
}
