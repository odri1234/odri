import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(BadRequestException)
export class ValidationFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    let message = 'Validation failed';

    let errors: any[] = [];

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      message = (exceptionResponse as any).message;
      if (Array.isArray(message)) {
        errors = message;
        message = 'Validation error';
      }
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      errors,
    };

    this.logger.warn(
      `[VALIDATION] ${request.method} ${request.url} - ${JSON.stringify(errors)}`,
    );

    response.status(status).json(errorResponse);
  }
}
