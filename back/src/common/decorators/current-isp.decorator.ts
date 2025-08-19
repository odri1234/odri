// src/common/decorators/current-isp.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Custom decorator to extract the ISP information from the authenticated user.
 *
 * Usage:
 * ```ts
 * @Get()
 * getSomething(@CurrentIsp() isp: any) {
 *   // use isp here
 * }
 * ```
 */
export const CurrentIsp = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request & { user?: { isp?: any } }>();
    return request.user?.isp;
  },
);
