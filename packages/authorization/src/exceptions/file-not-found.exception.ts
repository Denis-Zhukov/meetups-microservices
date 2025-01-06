import { HttpException, HttpStatus } from '@nestjs/common';

export class FileNotFoundException extends HttpException {
  constructor(message = 'File not found') {
    super(message, HttpStatus.NOT_FOUND);
  }
}
