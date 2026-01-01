import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { ValidationException } from '../exceptions/validation.exception';

type ClassConstructor<T = any> = {
  new (...args: any[]): T;
};

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown> {
    if (!metadata.metatype || !this.toValidate(metadata.metatype)) {
      return value;
    }

    if (value == null || typeof value !== 'object') {
      return value;
    }

    const metatype = metadata.metatype as ClassConstructor<unknown>;
    const object = plainToInstance(metatype, value);
    const errors: ValidationError[] = await validate(object as object);

    if (errors.length > 0) {
      const messages = this.buildErrorMessages(errors);
      throw new ValidationException(messages);
    }

    return value;
  }

  private toValidate(metatype: unknown): boolean {
    const types: unknown[] = [String, Boolean, Number, Array, Object];
    return !!metatype && !types.includes(metatype);
  }

  private buildErrorMessages(errors: ValidationError[]): Record<string, string> {
    const result: Record<string, string> = {};

    const flatten = (errs: ValidationError[]) => {
      errs.forEach((err) => {
        if (err.constraints) {
          result[err.property] = Object.values(err.constraints).join(', ');
        }
        if (err.children && err.children.length > 0) {
          flatten(err.children);
        }
      });
    };

    flatten(errors);
    return result;
  }
}
