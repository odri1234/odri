export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  PENDING = 'pending',
  FAILED = 'failed',
}

export enum VoucherStatus {
  UNUSED = 'unused',
  USED = 'used',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BLOCKED = 'blocked',
  DELETED = 'deleted',
}

export enum SystemHealthStatus {
  OK = 'ok',
  WARNING = 'warning',
  CRITICAL = 'critical',
  OFFLINE = 'offline',
}
