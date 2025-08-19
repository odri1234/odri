import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.shouldValidate(metatype)) {
      return value;
    }

    // Convert plain object to class instance
    const object = plainToInstance(metatype, value);

    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    if (errors.length > 0) {
      throw new BadRequestException(this.formatErrors(errors));
    }

    return object;
  }

  private shouldValidate(metatype: Function): boolean {
    const skipTypes: Function[] = [String, Boolean, Number, Array, Object];
    return !skipTypes.includes(metatype);
  }

  private formatErrors(errors: any[]) {
    return errors.map((err) => ({
      property: err.property,
      errors: Object.values(err.constraints || {}),
    }));
  }
}
