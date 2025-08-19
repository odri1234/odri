// src/modules/common/enums/user-role.enum.ts
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  ISP_ADMIN = 'ISP_ADMIN',
  ISP_STAFF = 'ISP_STAFF',
  CLIENT = 'CLIENT',
  STAFF = 'STAFF',
  AUDITOR = 'AUDITOR',
  SUPPORT = 'SUPPORT',
  TECHNICIAN = 'TECHNICIAN',
  FINANCE = 'FINANCE'
}

// For backward compatibility, also export as Role
export const Role = UserRole;