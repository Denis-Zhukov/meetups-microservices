import { HttpException, HttpStatus } from '@nestjs/common';

export class FileReadException extends HttpException {
  constructor(message = 'Error reading file') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
