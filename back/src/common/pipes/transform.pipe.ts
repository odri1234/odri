// src/common/pipes/transform.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class TransformPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    try {
      // Example: Convert stringified JSON to object
      if (typeof value === 'string' && value.trim().startsWith('{')) {
        return JSON.parse(value);
      }
      return value;
    } catch (error) {
      throw new BadRequestException('Invalid input format');
    }
  }
}
