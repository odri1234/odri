import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/constants/user-role.constants'; // Use central enum import

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Allow access if no roles specified on the route
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      this.logger.warn('Access denied: No user or role attached to request.');
      throw new ForbiddenException('Access denied: missing user information.');
    }

    // Support multiple roles per user or single role string
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];

    // SUPER_ADMIN has access to everything
    if (userRoles.includes(UserRole.SUPER_ADMIN)) {
      this.logger.log(`SUPER_ADMIN user ${user.email || user.id} granted access`);
      return true;
    }

    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      this.logger.warn(
        `Access denied for user ${user.email || user.id}: Required roles: [${requiredRoles.join(
          ', ',
        )}], User role(s): [${userRoles.join(', ')}]`,
      );
      throw new ForbiddenException('You do not have the required role to access this resource.');
    }

    return true;
  }
}
