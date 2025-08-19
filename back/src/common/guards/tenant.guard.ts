// src/common/guards/tenant.guard.ts

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserRole } from '../../modules/users/constants/user-role.constants';

@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Allow public routes to bypass tenant checks
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();

    // Check if user is SUPER_ADMIN (bypass tenant requirement)
    if (request.user && request.user.role === UserRole.SUPER_ADMIN) {
      this.logger.log(`SUPER_ADMIN user ${request.user.email} bypassing tenant check`);
      return true;
    }

    const tenantId: string | undefined = request.headers['x-tenant-id'];

    if (!tenantId || typeof tenantId !== 'string' || tenantId.trim() === '') {
      this.logger.warn(`Access denied: Missing or invalid 'x-tenant-id' header`);
      throw new UnauthorizedException(`Missing or invalid 'x-tenant-id' header`);
    }

    // Attach the tenantId to the request for downstream use
    request.tenantId = tenantId.trim();

    return true;
  }
}
