// src/modules/common/enums/audit-action.enum.ts
export enum LogAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout'
}

export type AuditActionType = LogAction;