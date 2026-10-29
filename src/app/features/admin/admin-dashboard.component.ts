import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../core/services/request.service';
import { AuthService } from '../../core/services/auth.service';
import { AuditLogService } from '../../core/services/audit-log.service';
import { HealthRequest, RequestStatus } from '../../core/models/request.model';
import { UserProfile, UserRole } from '../../core/models/user.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { CertificateModalComponent } from '../../shared/components/certificate-modal.component';
import { PdfCertificateService } from '../../core/services/pdf-certificate.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent, CertificateModalComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      <!-- Admin Header Banner -->
      <div class="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-400/30 text-purple-200 text-xs font-semibold mb-3">
              <span>🛡️</span>
              <span>Campus Health Administration & IAS Oversight</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Administrative Control Center
            </h1>
            <p class="text-purple-100/90 text-xs sm:text-sm mt-1 leading-relaxed">
              Supervising Campus Health Dispatch, role-based access permissions, master boarding queues, and cryptographic audit records.
            </p>
          </div>

          <!-- Reset / Demo Controls -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="resetDemoData()"
              class="px-4 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 border border-white/20 transition-all flex items-center gap-1.5"
            >
              <span>🔄</span>
              <span>Restore Demo Data</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Overview Statistics Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Total Requests -->
        <div class="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/90 flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Requests</span>
            <span class="text-3xl font-black text-slate-900 mt-1 block">{{ requestService.stats().total }}</span>
            <span class="text-[11px] text-teal-600 font-medium">All boarding houses</span>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl">
            📋
          </div>
        </div>

        <!-- Pending Cases -->
        <div class="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/90 flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Pending Dispatch</span>
            <span class="text-3xl font-black text-amber-600 mt-1 block">{{ requestService.stats().pending }}</span>
            <span class="text-[11px] text-amber-600 font-medium">Awaiting acceptance</span>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
            ⏳
          </div>
        </div>

        <!-- Completed Cases -->
        <div class="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/90 flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Completed</span>
            <span class="text-3xl font-black text-emerald-600 mt-1 block">{{ requestService.stats().completed }}</span>
            <span class="text-[11px] text-emerald-600 font-medium">Certificates generated</span>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            📄
          </div>
        </div>

        <!-- Active Personnel -->
        <div class="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/90 flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Health Personnel</span>
            <span class="text-3xl font-black text-sky-600 mt-1 block">{{ activePersonnelCount() }}</span>
            <span class="text-[11px] text-sky-600 font-medium">Active clinical staff</span>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl">
            🩺
          </div>
        </div>

      </div>

      <!-- Navigation Tabs: Master Queue | User Management | Audit Logs -->
      <div class="bg-white rounded-3xl p-2 shadow-xs border border-slate-200/90 flex rounded-2xl bg-slate-100 p-1 text-xs font-bold max-w-md">
        <button
          type="button"
          (click)="activeTab.set('queue')"
          class="flex-1 py-2 rounded-xl transition-all"
          [ngClass]="activeTab() === 'queue' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
        >
          Master Queue ({{ requestService.requests().length }})
        </button>
        <button
          type="button"
          (click)="activeTab.set('users')"
          class="flex-1 py-2 rounded-xl transition-all"
          [ngClass]="activeTab() === 'users' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
        >
          User Accounts ({{ usersList().length }})
        </button>
        <button
          type="button"
          (click)="activeTab.set('audit')"
          class="flex-1 py-2 rounded-xl transition-all"
          [ngClass]="activeTab() === 'audit' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
        >
          Audit Trail ({{ auditService.logs().length }})
        </button>
      </div>

      <!-- TAB 1: MASTER QUEUE & OVERRIDE CONTROLS -->
      @if (activeTab() === 'queue') {
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 class="text-base font-bold text-slate-900">Master Health Request Oversight</h2>
              <p class="text-xs text-slate-500">Supervise, reassign personnel, or override request statuses</p>
            </div>
            <div class="w-full sm:w-64">
              <input
                type="text"
                [(ngModel)]="searchQueueText"
                placeholder="Search by student, ID, or address..."
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <!-- Master Queue Table / Cards -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-700">
              <thead class="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th class="py-3 px-3">Case ID</th>
                  <th class="py-3 px-3">Student Patient</th>
                  <th class="py-3 px-3">Boarding House</th>
                  <th class="py-3 px-3">Status</th>
                  <th class="py-3 px-3">Assigned Personnel</th>
                  <th class="py-3 px-3 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (req of filteredQueue(); track req.id) {
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    
                    <!-- Case ID -->
                    <td class="py-3.5 px-3">
                      <span class="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {{ req.id }}
                      </span>
                      <div class="text-[10px] text-slate-400 mt-0.5">{{ formatDate(req.createdAt) }}</div>
                    </td>

                    <!-- Student Info -->
                    <td class="py-3.5 px-3">
                      <strong class="text-slate-900 block font-semibold">{{ req.studentName }}</strong>
                      <span class="text-[11px] text-slate-500">{{ req.studentContact }}</span>
                    </td>

                    <!-- Boarding Address & Symptoms -->
                    <td class="py-3.5 px-3 max-w-xs">
                      <div class="text-slate-800 truncate font-medium">📍 {{ req.boardingAddress }}</div>
                      <div class="text-slate-500 text-[11px] truncate mt-0.5">{{ req.symptoms }}</div>
                    </td>

                    <!-- Status -->
                    <td class="py-3.5 px-3">
                      <app-status-badge [status]="req.status" />
                    </td>

                    <!-- Assigned Personnel -->
                    <td class="py-3.5 px-3">
                      @if (req.assignedPersonnelName) {
                        <span class="font-medium text-slate-800">🩺 {{ req.assignedPersonnelName }}</span>
                      } @else {
                        <span class="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200">
                          Unassigned
                        </span>
                      }
                    </td>

                    <!-- Override & Certificate Actions -->
                    <td class="py-3.5 px-3 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          (click)="openOverrideModal(req)"
                          class="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 transition-colors"
                        >
                          ⚙️ Reassign / Override
                        </button>
                        
                        @if (req.status === 'Completed') {
                          <button
                            type="button"
                            (click)="previewCert(req)"
                            class="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          >
                            📄 Cert
                          </button>
                        }
                      </div>
                    </td>

                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 2: USER MANAGEMENT (ROLE-BASED ACCESS CONTROL) -->
      @if (activeTab() === 'users') {
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 class="text-base font-bold text-slate-900">User Role & Account Management</h2>
              <p class="text-xs text-slate-500">Configure Role-Based Access Control (RBAC) across Students, Personnel, and Admins</p>
            </div>
            <div class="text-xs text-slate-600 font-medium">
              Registered Accounts: <strong>{{ usersList().length }}</strong>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-700">
              <thead class="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th class="py-3 px-3">User</th>
                  <th class="py-3 px-3">Email</th>
                  <th class="py-3 px-3">Contact / Residence</th>
                  <th class="py-3 px-3">Role</th>
                  <th class="py-3 px-3">Status</th>
                  <th class="py-3 px-3 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (u of usersList(); track u.uid) {
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-3.5 px-3 font-semibold text-slate-900 flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                        {{ u.fullName.charAt(0) }}
                      </div>
                      <span>{{ u.fullName }}</span>
                    </td>
                    <td class="py-3.5 px-3 font-mono text-[11px] text-slate-600">{{ u.email }}</td>
                    <td class="py-3.5 px-3 text-[11px] text-slate-600">
                      <div>{{ u.contactNumber }}</div>
                      @if (u.boardingAddress) {
                        <div class="text-slate-400 truncate max-w-xs">📍 {{ u.boardingAddress }}</div>
                      }
                    </td>
                    <td class="py-3.5 px-3">
                      <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        [ngClass]="getRoleBadgeClass(u.role)"
                      >
                        {{ authService.getRoleLabel(u.role) }}
                      </span>
                    </td>
                    <td class="py-3.5 px-3">
                      <span class="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </td>
                    <td class="py-3.5 px-3 text-right">
                      <select
                        [ngModel]="u.role"
                        (ngModelChange)="onUserRoleChange(u.uid, $event)"
                        class="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="student">Student</option>
                        <option value="medical_personnel">Medical Personnel</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 3: AUDIT TRAIL & IAS SECURITY LOGS -->
      @if (activeTab() === 'audit') {
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 class="text-base font-bold text-slate-900">Information Assurance & Security (IAS) Audit Trail</h2>
              <p class="text-xs text-slate-500">Non-repudiation, tamper-evident action logs and SHA-256 integrity tokens</p>
            </div>
            <span class="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold">
              🔒 Tamper-Resistant Logging Active
            </span>
          </div>

          <div class="space-y-3">
            @for (log of auditService.logs(); track log.id) {
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-900">{{ log.action }}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 text-slate-700">
                      {{ log.id }}
                    </span>
                    <span class="text-[11px] text-slate-400">
                      {{ formatDate(log.timestamp) }}
                    </span>
                  </div>
                  <p class="text-slate-700">{{ log.details }}</p>
                  <div class="text-[11px] text-slate-500">
                    Performed by: <strong>{{ log.performedBy }}</strong> ({{ log.userRole }})
                  </div>
                </div>

                <div class="text-right shrink-0">
                  <span class="text-[10px] font-mono text-teal-800 bg-teal-50 px-2 py-1 rounded border border-teal-200/80 block">
                    {{ log.integrityHash }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      }

    </div>

    <!-- Admin Override Modal -->
    @if (selectedOverrideRequest()) {
      <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
        <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 p-6 space-y-4 text-xs">
          
          <div class="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 class="font-bold text-base text-slate-900">Admin Override & Reassignment</h3>
              <p class="text-slate-500">Case ID: {{ selectedOverrideRequest()?.id }} ({{ selectedOverrideRequest()?.studentName }})</p>
            </div>
            <button
              type="button"
              (click)="selectedOverrideRequest.set(null)"
              class="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>

          <!-- Override Status -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Override Status:</label>
            <select
              [(ngModel)]="overrideStatus"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold"
            >
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <!-- Reassign Personnel -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Assign to Health Personnel:</label>
            <select
              [(ngModel)]="overridePersonnelUid"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-medium"
            >
              <option value="">-- Leave Unassigned --</option>
              @for (p of personnelList(); track p.uid) {
                <option [value]="p.uid">{{ p.fullName }} ({{ p.email }})</option>
              }
            </select>
          </div>

          <!-- Reason for Override (Audit trail compliance) -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">
              Audit Reason for Override: <span class="text-rose-500">*</span>
            </label>
            <input
              type="text"
              [(ngModel)]="overrideReason"
              placeholder="e.g. Health responder reassigned due to emergency triage."
              class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
            />
          </div>

          <!-- Modal Footer -->
          <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              (click)="selectedOverrideRequest.set(null)"
              class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="applyOverride()"
              class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 shadow-md"
            >
              Apply Admin Override
            </button>
          </div>

        </div>
      </div>
    }

    <!-- Modal for Previewing & Downloading Certificate -->
    <app-certificate-modal
      [request]="selectedCertificateRequest()"
      (close)="selectedCertificateRequest.set(null)"
    />
  `
})
export class AdminDashboardComponent {
  readonly authService = inject(AuthService);
  readonly requestService = inject(RequestService);
  readonly auditService = inject(AuditLogService);
  private pdfService = inject(PdfCertificateService);

  activeTab = signal<'queue' | 'users' | 'audit'>('queue');
  searchQueueText = '';
  selectedOverrideRequest = signal<HealthRequest | null>(null);
  selectedCertificateRequest = signal<HealthRequest | null>(null);

  overrideStatus: RequestStatus = 'Pending';
  overridePersonnelUid = '';
  overrideReason = 'Standard administrative reassignment';

  readonly usersList = signal<UserProfile[]>(this.authService.getAllStoredUsers());

  readonly personnelList = computed(() =>
    this.usersList().filter(u => u.role === 'medical_personnel')
  );

  readonly activePersonnelCount = computed(() => this.personnelList().length);

  readonly filteredQueue = computed(() => {
    let list = this.requestService.requests();
    if (this.searchQueueText.trim()) {
      const q = this.searchQueueText.toLowerCase();
      list = list.filter(r =>
        r.studentName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.boardingAddress.toLowerCase().includes(q)
      );
    }
    return list;
  });

  onUserRoleChange(uid: string, newRole: UserRole) {
    this.authService.adminUpdateUser(uid, { role: newRole });
    this.usersList.set(this.authService.getAllStoredUsers());
  }

  openOverrideModal(req: HealthRequest) {
    this.selectedOverrideRequest.set(req);
    this.overrideStatus = req.status;
    this.overridePersonnelUid = req.assignedPersonnelId || '';
    this.overrideReason = 'Administrative queue rebalance';
  }

  applyOverride() {
    const req = this.selectedOverrideRequest();
    if (!req) return;

    let personnelName: string | undefined = undefined;
    if (this.overridePersonnelUid) {
      const found = this.personnelList().find(p => p.uid === this.overridePersonnelUid);
      personnelName = found ? found.fullName : undefined;
    }

    this.requestService.adminOverride(req.id, {
      status: this.overrideStatus,
      assignedPersonnelId: this.overridePersonnelUid || undefined,
      assignedPersonnelName: personnelName,
      reason: this.overrideReason || 'Administrative reassignment'
    });

    this.selectedOverrideRequest.set(null);
  }

  previewCert(req: HealthRequest) {
    this.selectedCertificateRequest.set(req);
  }

  resetDemoData() {
    this.requestService.resetToSeedData();
    localStorage.removeItem('vitacall_users_db');
    this.usersList.set(this.authService.getAllStoredUsers());
  }

  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case 'student': return 'bg-teal-50 text-teal-800 border border-teal-200';
      case 'medical_personnel': return 'bg-sky-50 text-sky-800 border border-sky-200';
      case 'admin': return 'bg-purple-50 text-purple-800 border border-purple-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  }

  formatDate(isoString: string): string {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
  }
}
