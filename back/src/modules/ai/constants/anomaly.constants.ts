// src/modules/ai/constants/anomaly.constants.ts

export enum AnomalyType {
  USAGE_SPIKE = 'usage-spike',
  UNUSUAL_USAGE = 'unusual_usage',
  MULTI_LOGIN = 'multi-login',
  LOCATION_JUMP = 'location-jump',
  DEVICE_SPOOF = 'device-spoof',
  FRAUD_ATTEMPT = 'fraud-attempt',
  SUSPICIOUS_PAYMENT = 'suspicious-payment',
  FRAUD_DETECTION = 'fraud-detection',
  SESSION_HIJACK = 'session-hijack',
  UNUSUAL_ACTIVITY = 'unusual-activity',
}

export enum AnomalySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}
