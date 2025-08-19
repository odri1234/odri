import { HttpStatus } from '@nestjs/common';

export class ResponseUtil {
  static success(message: string, data?: any, statusCode: number = HttpStatus.OK) {
    return {
      statusCode,
      success: true,
      message,
      data: data ?? null,
      timestamp: new Date().toISOString(),
    };
  }

  static created(message: string, data?: any) {
    return this.success(message, data, HttpStatus.CREATED);
  }

  static deleted(message: string) {
    return this.success(message, null, HttpStatus.NO_CONTENT);
  }

  static error(message: string, errors: any = null, statusCode: number = HttpStatus.BAD_REQUEST) {
    return {
      statusCode,
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  static paginated(message: string, items: any[], total: number, page: number, limit: number) {
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message,
      data: {
        items,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      timestamp: new Date().toISOString(),
    };
  }
}
