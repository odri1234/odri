// src/common/constants/roles.constant.ts

/**
 * Enum for system-wide role identifiers (e.g., for guards and decorators).
 */
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  ISP = 'ISP',
  USER = 'USER',
}

/**
 * Enum for user-facing role names used in UI, DB, or user management.
 */
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

/**
 * Default roles used for user registration or seeding.
 */
export const DEFAULT_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.ISP_ADMIN,
  UserRole.ISP_STAFF,
  UserRole.CLIENT,
  UserRole.STAFF,
  UserRole.AUDITOR,
  UserRole.SUPPORT,
  UserRole.TECHNICIAN,
  UserRole.FINANCE
];
