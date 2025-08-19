// safe-user.dto.ts

import { UserRole } from '../../users/constants/user-role.constants';

export class SafeUserDto {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  twoFactorEnabled: boolean;
}
