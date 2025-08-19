// src/modules/auth/guards/rate-limit.guard.ts

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

/**
 * Simple in-memory rate limiter (per IP).
 * For production, consider using Redis or a global rate-limiting solution.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly requestCounts = new Map<string, { count: number; timestamp: number }>();
  private readonly WINDOW_SIZE_IN_SECONDS = 60;
  private readonly MAX_REQUESTS_PER_WINDOW = 10;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress;

    const currentTime = Date.now();
    const windowStart = currentTime - this.WINDOW_SIZE_IN_SECONDS * 1000;

    const record = this.requestCounts.get(ip);

    if (!record || record.timestamp < windowStart) {
      this.requestCounts.set(ip, { count: 1, timestamp: currentTime });
      return true;
    }

    if (record.count >= this.MAX_REQUESTS_PER_WINDOW) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    record.count += 1;
    this.requestCounts.set(ip, record);
    return true;
  }
}
