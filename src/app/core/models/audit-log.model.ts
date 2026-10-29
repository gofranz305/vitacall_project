export type AuditAction = 
  | 'USER_LOGIN'
  | 'USER_REGISTER'
  | 'REQUEST_SUBMITTED'
  | 'REQUEST_ASSIGNED'
  | 'STATUS_UPDATED'
  | 'RESULTS_RECORDED'
  | 'CERTIFICATE_GENERATED'
  | 'CERTIFICATE_DOWNLOADED'
  | 'CERTIFICATE_VERIFIED'
  | 'ADMIN_OVERRIDE'
  | 'ROLE_UPDATED';

export interface AuditLog {
  id: string;
  action: AuditAction;
  performedBy: string; // User Name or UID
  performedByEmail: string;
  userRole: string;
  targetId?: string; // Request ID or Certificate ID or User UID
  details: string;
  timestamp: string;
  ipAddress?: string;
  integrityHash?: string;
}
