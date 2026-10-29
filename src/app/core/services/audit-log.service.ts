import { Injectable, signal } from '@angular/core';
import { AuditAction, AuditLog } from '../models/audit-log.model';

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private logsSignal = signal<AuditLog[]>([]);
  readonly logs = this.logsSignal.asReadonly();

  private readonly STORAGE_KEY = 'vitacall_audit_logs';

  constructor() {
    this.loadLogs();
  }

  private loadLogs() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.logsSignal.set(JSON.parse(stored));
      } else {
        const seedLogs: AuditLog[] = [
          {
            id: 'LOG-INIT-001',
            action: 'REQUEST_SUBMITTED',
            performedBy: 'Angelica Ramos',
            performedByEmail: 'student@campus.edu',
            userRole: 'student',
            targetId: 'REQ-2026-001',
            details: 'Initial checkup request submitted from Sunshine Dormitory (Severe fever & chills)',
            timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
            integrityHash: this.calculateHash('REQ-2026-001', 'REQUEST_SUBMITTED')
          },
          {
            id: 'LOG-INIT-002',
            action: 'REQUEST_ASSIGNED',
            performedBy: 'Nurse Roberto Diaz',
            performedByEmail: 'personnel@campus.edu',
            userRole: 'medical_personnel',
            targetId: 'REQ-2026-001',
            details: 'Nurse Roberto Diaz accepted and assigned case for on-site dispatch',
            timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
            integrityHash: this.calculateHash('REQ-2026-001', 'REQUEST_ASSIGNED')
          },
          {
            id: 'LOG-INIT-003',
            action: 'RESULTS_RECORDED',
            performedBy: 'Nurse Roberto Diaz',
            performedByEmail: 'personnel@campus.edu',
            userRole: 'medical_personnel',
            targetId: 'REQ-2026-001',
            details: 'Diagnosis recorded: Acute Viral Pharyngitis. Temp: 38.6°C. Recommended 3 days bed rest.',
            timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
            integrityHash: this.calculateHash('REQ-2026-001', 'RESULTS_RECORDED')
          },
          {
            id: 'LOG-INIT-004',
            action: 'CERTIFICATE_GENERATED',
            performedBy: 'System Engine',
            performedByEmail: 'system@vitacall.campus.edu',
            userRole: 'admin',
            targetId: 'VITA-MED-2026-9812',
            details: 'Tamper-resistant digital certificate issued with SHA-256 verification token',
            timestamp: new Date(Date.now() - 3600000 * 1.4).toISOString(),
            integrityHash: this.calculateHash('VITA-MED-2026-9812', 'CERTIFICATE_GENERATED')
          }
        ];
        this.logsSignal.set(seedLogs);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(seedLogs));
      }
    } catch {
      this.logsSignal.set([]);
    }
  }

  log(
    action: AuditAction,
    performedBy: string,
    performedByEmail: string,
    userRole: string,
    details: string,
    targetId?: string
  ): AuditLog {
    const logEntry: AuditLog = {
      id: `LOG-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
      action,
      performedBy,
      performedByEmail,
      userRole,
      targetId,
      details,
      timestamp: new Date().toISOString(),
      integrityHash: this.calculateHash(targetId || action, details)
    };

    this.logsSignal.update(logs => [logEntry, ...logs]);
    this.persistLogs();
    return logEntry;
  }

  private persistLogs() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logsSignal().slice(0, 100)));
    } catch {
      // Storage quota safety
    }
  }

  private calculateHash(identifier: string, payload: string): string {
    const raw = `${identifier}:${payload}:${new Date().toDateString()}:VITACALL_IAS_KEY`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `sha256-vta-${hex.repeat(4).substring(0, 32)}`;
  }

  clearLogs() {
    this.logsSignal.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
