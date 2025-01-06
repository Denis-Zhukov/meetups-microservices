import { HttpException, HttpStatus } from '@nestjs/common';

export class WrongMimeTypeException extends HttpException {
  constructor(
    extensions: string[],
    message = `Invalid file type. Only ${extensions} are allowed.`
  ) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
