import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../modules/users/constants/user-role.constants';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(ROLES_KEY, roles);
