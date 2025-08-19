// src/common/enums/anomaly-type.enum.ts

export enum AnomalyType {
  FRAUD_ATTEMPT = 'FRAUD_ATTEMPT',               // Fraud detection event
  SESSION_HIJACK = 'SESSION_HIJACK',             // Session hijacking detected
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',   // Unauthorized access attempt
  MULTIPLE_LOGIN_FAILURES = 'MULTIPLE_LOGIN_FAILURES', // Many failed login attempts
  DATA_LEAK_ATTEMPT = 'DATA_LEAK_ATTEMPT',       // Attempt to leak data
  UNUSUAL_ACTIVITY = 'UNUSUAL_ACTIVITY',         // Other unusual activities
  SYSTEM_ANOMALY = 'SYSTEM_ANOMALY'               // System-related anomalies
}
