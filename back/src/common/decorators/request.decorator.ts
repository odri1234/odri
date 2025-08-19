import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';

export interface RequestWithUser extends ExpressRequest {
  user?: {
    id: string;
    ispId: string;
    roles: string[];
    [key: string]: any;
  };
}

export const Request = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestWithUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request;
  },
);