// src/modules/notifications/enums/notification.enums.ts

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  TELEGRAM = 'telegram',
  WHATSAPP = 'whatsapp',
  ALL = 'all',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',    // Use NORMAL instead of MEDIUM (to standardize)
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  DELIVERED = 'delivered', // Added from first example
}
