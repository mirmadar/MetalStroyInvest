import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(public readonly messages: Record<string, string>) {
    super(messages, HttpStatus.BAD_REQUEST);
  }
}
