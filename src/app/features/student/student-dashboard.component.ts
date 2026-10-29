import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RequestService } from '../../core/services/request.service';
import { AuthService } from '../../core/services/auth.service';
import { HealthRequest, RequestStatus, SeverityLevel } from '../../core/models/request.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { CertificateModalComponent } from '../../shared/components/certificate-modal.component';
import { PdfCertificateService } from '../../core/services/pdf-certificate.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgeComponent, CertificateModalComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      <!-- Welcome & Context Header -->
      <div class="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div class="relative z-10 max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/50 border border-teal-500/30 text-teal-200 text-xs font-semibold mb-3">
            <span>🏠</span>
            <span>Boarding House Health Care Dispatch</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {{ authService.currentUser()?.fullName || 'Student' }}!
          </h1>
          <p class="text-teal-100/90 text-xs sm:text-sm mt-1.5 leading-relaxed font-normal">
            Feeling sick in your boarding house? Submit an on-site health checkup request. Our campus health personnel will travel directly to your residence and issue an official medical certificate.
          </p>
          <div class="flex flex-wrap gap-3 mt-4 text-xs font-medium">
            <span class="bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
              📍 Residence: <strong>{{ authService.currentUser()?.boardingAddress || 'Room 304, Sunshine Dormitory' }}</strong>
            </span>
            <span class="bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
              📞 Emergency Hotline: <strong>(02) 8920-1234</strong>
            </span>
          </div>
        </div>
      </div>

      <!-- Main Action Area: Grid with Request Form (Left/Top) and Active Tracking (Right/Bottom) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Checkup Request Form (5 Cols on LG) -->
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg">
                  ✍️
                </div>
                <div>
                  <h2 class="text-base font-bold text-slate-900">Request Health Checkup</h2>
                  <p class="text-xs text-slate-500">Boarding house medical visit</p>
                </div>
              </div>
            </div>

            <form [formGroup]="requestForm" (ngSubmit)="submitRequest()" class="space-y-4">
              
              <!-- Quick Common Symptoms Tags -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-2">Common Symptoms (Click to toggle):</label>
                <div class="flex flex-wrap gap-1.5">
                  @for (tag of commonSymptomTags; track tag) {
                    <button
                      type="button"
                      (click)="toggleSymptomTag(tag)"
                      class="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                      [ngClass]="isTagSelected(tag) ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                    >
                      {{ isTagSelected(tag) ? '✓ ' + tag : '+ ' + tag }}
                    </button>
                  }
                </div>
              </div>

              <!-- Symptoms Textarea -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Describe what you are feeling: <span class="text-rose-500">*</span>
                </label>
                <textarea
                  rows="3"
                  formControlName="symptoms"
                  placeholder="e.g. Feeling high fever since last night, severe sore throat, chills, unable to walk to clinic..."
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                ></textarea>
                @if (requestForm.get('symptoms')?.touched && requestForm.get('symptoms')?.invalid) {
                  <span class="text-[11px] text-rose-500 mt-1 block">Please describe your symptoms.</span>
                }
              </div>

              <!-- Urgency / Severity Level -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Urgency Level:</label>
                <div class="grid grid-cols-3 gap-2">
                  @for (lvl of severityLevels; track lvl) {
                    <button
                      type="button"
                      (click)="setSeverity(lvl)"
                      class="py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all"
                      [ngClass]="getSeverityClass(lvl)"
                    >
                      {{ lvl }}
                    </button>
                  }
                </div>
              </div>

              <!-- Boarding House Address -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Boarding House Address / Room Number: <span class="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  formControlName="boardingAddress"
                  placeholder="e.g. Room 304, Sunshine Dormitory, University Belt"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                />
              </div>

              <!-- Preferred Schedule -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Schedule: <span class="text-rose-500">*</span>
                </label>
                <select
                  formControlName="preferredSchedule"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all font-medium"
                >
                  <option value="Urgent / As soon as possible">⚡ Urgent / As soon as possible</option>
                  <option value="Today - Morning (8:00 AM - 12:00 PM)">Today - Morning (8:00 AM - 12:00 PM)</option>
                  <option value="Today - Afternoon (1:00 PM - 5:00 PM)">Today - Afternoon (1:00 PM - 5:00 PM)</option>
                  <option value="Tomorrow - Morning (8:00 AM - 12:00 PM)">Tomorrow - Morning (8:00 AM - 12:00 PM)</option>
                </select>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                [disabled]="isSubmitting() || requestForm.invalid"
                class="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md shadow-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                @if (isSubmitting()) {
                  <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Dispatching Request...</span>
                } @else {
                  <span>🚑 Submit Checkup Request</span>
                }
              </button>
            </form>
          </div>

          <!-- Quick FAQ / Support Card -->
          <div class="bg-teal-50/70 border border-teal-200/60 rounded-3xl p-5 text-xs text-teal-950 space-y-2">
            <div class="font-bold text-teal-900 flex items-center gap-1.5">
              <span>💡</span> What happens after you submit?
            </div>
            <ul class="list-disc list-inside space-y-1 text-teal-800 text-[11px] leading-relaxed">
              <li>Your request appears immediately on the campus medical personnel queue.</li>
              <li>A registered nurse/health officer accepts the request and travels to your boarding house.</li>
              <li>Upon examination, you will receive recommendations and your official PDF certificate will be generated automatically.</li>
            </ul>
          </div>
        </div>

        <!-- Request Tracking & History (7 Cols on LG) -->
        <div class="lg:col-span-7 space-y-6">
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
            
            <!-- Header & Filter Tabs -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 class="text-base font-bold text-slate-900">Checkup Requests & Live Status</h2>
                <p class="text-xs text-slate-500">Real-time status tracking and certificate downloads</p>
              </div>
              <div class="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold self-start sm:self-auto">
                <button
                  type="button"
                  (click)="filterMode.set('all')"
                  class="px-3 py-1.5 rounded-lg transition-all"
                  [ngClass]="filterMode() === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'"
                >
                  All ({{ myRequests().length }})
                </button>
                <button
                  type="button"
                  (click)="filterMode.set('active')"
                  class="px-3 py-1.5 rounded-lg transition-all"
                  [ngClass]="filterMode() === 'active' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'"
                >
                  Active
                </button>
                <button
                  type="button"
                  (click)="filterMode.set('completed')"
                  class="px-3 py-1.5 rounded-lg transition-all"
                  [ngClass]="filterMode() === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'"
                >
                  Completed ({{ completedCertificatesCount() }})
                </button>
              </div>
            </div>

            <!-- Requests List -->
            @if (filteredRequests().length === 0) {
              <div class="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300">
                <span class="text-4xl block mb-2">🌿</span>
                <h4 class="font-bold text-slate-800 text-sm">No Requests Found</h4>
                <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  You do not have any requests in this view. Fill out the request form whenever you need campus medical assistance.
                </p>
              </div>
            } @else {
              <div class="space-y-4">
                @for (req of filteredRequests(); track req.id) {
                  <div class="border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-teal-300 transition-all bg-white shadow-xs">
                    
                    <!-- Top Row: Request ID & Status Badge -->
                    <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div class="flex items-center gap-2">
                        <span class="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {{ req.id }}
                        </span>
                        <span class="text-[11px] text-slate-400">
                          Submitted {{ formatDate(req.createdAt) }}
                        </span>
                      </div>
                      <app-status-badge [status]="req.status" />
                    </div>

                    <!-- Pipeline Progress Tracker (Pending -> Assigned -> In Progress -> Completed) -->
                    <div class="py-4">
                      <div class="relative flex items-center justify-between">
                        <!-- Horizontal connector line -->
                        <div class="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-0"></div>
                        <div
                          class="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-teal-500 transition-all duration-500 -z-0"
                          [style.width]="getPipelinePercentage(req.status)"
                        ></div>

                        <!-- Step 1: Pending -->
                        <div class="flex flex-col items-center gap-1 z-10">
                          <div
                            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                            [ngClass]="getStepCircleClass(req.status, 'Pending')"
                          >
                            1
                          </div>
                          <span class="text-[10px] font-semibold text-slate-600">Pending</span>
                        </div>

                        <!-- Step 2: Assigned -->
                        <div class="flex flex-col items-center gap-1 z-10">
                          <div
                            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                            [ngClass]="getStepCircleClass(req.status, 'Assigned')"
                          >
                            2
                          </div>
                          <span class="text-[10px] font-semibold text-slate-600">Assigned</span>
                        </div>

                        <!-- Step 3: In Progress -->
                        <div class="flex flex-col items-center gap-1 z-10">
                          <div
                            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                            [ngClass]="getStepCircleClass(req.status, 'In Progress')"
                          >
                            3
                          </div>
                          <span class="text-[10px] font-semibold text-slate-600">In Progress</span>
                        </div>

                        <!-- Step 4: Completed -->
                        <div class="flex flex-col items-center gap-1 z-10">
                          <div
                            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                            [ngClass]="getStepCircleClass(req.status, 'Completed')"
                          >
                            4
                          </div>
                          <span class="text-[10px] font-semibold text-slate-600">Completed</span>
                        </div>
                      </div>
                    </div>

                    <!-- Details Area -->
                    <div class="text-xs space-y-2 pt-2 border-t border-slate-100">
                      <div>
                        <strong class="text-slate-800">Symptoms: </strong>
                        <span class="text-slate-600">{{ req.symptoms }}</span>
                      </div>

                      <div class="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-[11px]">
                        <span>📍 Residence: <strong class="text-slate-700">{{ req.boardingAddress }}</strong></span>
                        <span>⏰ Preference: <strong class="text-slate-700">{{ req.preferredSchedule }}</strong></span>
                      </div>

                      @if (req.assignedPersonnelName) {
                        <div class="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 text-[11px] flex items-center justify-between">
                          <div class="flex items-center gap-2">
                            <span class="text-base">🩺</span>
                            <div>
                              <div class="font-bold text-sky-950">Assigned: {{ req.assignedPersonnelName }}</div>
                              <div class="text-sky-700">Campus Health Dispatch Unit</div>
                            </div>
                          </div>
                          @if (req.assignedPersonnelContact) {
                            <a [href]="'tel:' + req.assignedPersonnelContact" class="text-sky-800 hover:underline font-bold">
                              📞 {{ req.assignedPersonnelContact }}
                            </a>
                          }
                        </div>
                      }

                      <!-- Completed Checkup Results & Certificate Download Section -->
                      @if (req.status === 'Completed') {
                        <div class="mt-3 p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div class="flex items-center gap-1.5">
                              <span class="text-emerald-700 font-bold text-xs">Official Medical Certificate Issued</span>
                              <span class="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-mono text-[10px] font-bold">
                                {{ req.certificateId || 'VITA-MED-2026' }}
                              </span>
                            </div>
                            <div class="text-emerald-800 text-[11px] mt-0.5">
                              Diagnosis: <strong>{{ req.diagnosis }}</strong>
                              @if (req.restDaysRecommended) {
                                <span> • Excused from classes for {{ req.restDaysRecommended }} days</span>
                              }
                            </div>
                          </div>

                          <div class="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              (click)="viewCertificate(req)"
                              class="px-3 py-1.5 rounded-xl bg-white text-emerald-800 border border-emerald-300 font-bold text-xs hover:bg-emerald-100 transition-colors shadow-2xs"
                            >
                              👁️ Preview
                            </button>
                            <button
                              type="button"
                              (click)="downloadCertificate(req)"
                              class="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1"
                            >
                              📥 Download PDF
                            </button>
                          </div>
                        </div>
                      }
                    </div>

                  </div>
                }
              </div>
            }

          </div>
        </div>

      </div>

    </div>

    <!-- Modal for Previewing & Downloading Certificate -->
    <app-certificate-modal
      [request]="selectedCertificateRequest()"
      (close)="selectedCertificateRequest.set(null)"
    />
  `
})
export class StudentDashboardComponent {
  private fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  private requestService = inject(RequestService);
  private pdfService = inject(PdfCertificateService);

  isSubmitting = signal<boolean>(false);
  filterMode = signal<'all' | 'active' | 'completed'>('all');
  selectedCertificateRequest = signal<HealthRequest | null>(null);

  commonSymptomTags: string[] = [
    'Fever',
    'Chills',
    'Sore Throat',
    'Cough',
    'Migraine',
    'Dizziness',
    'Stomach Pain',
    'Vomiting',
    'Body Weakness',
    'Difficulty Breathing'
  ];

  selectedTags = signal<string[]>(['Fever']);
  selectedSeverity = signal<SeverityLevel>('Moderate');
  severityLevels: SeverityLevel[] = ['Mild', 'Moderate', 'Severe / Urgent'];

  requestForm: FormGroup = this.fb.group({
    symptoms: ['High fever and severe sore throat since early morning. Unable to attend class.'],
    boardingAddress: [this.authService.currentUser()?.boardingAddress || 'Room 304, Sunshine Dormitory, University Belt', Validators.required],
    preferredSchedule: ['Urgent / As soon as possible', Validators.required]
  });

  // Filter requests belonging to current student
  readonly myRequests = computed(() => {
    const user = this.authService.currentUser();
    const all = this.requestService.requests();
    if (!user) return [];
    return all.filter(r => r.studentId === user.uid || r.studentName === user.fullName);
  });

  readonly completedCertificatesCount = computed(() => 
    this.myRequests().filter(r => r.status === 'Completed').length
  );

  readonly filteredRequests = computed(() => {
    const list = this.myRequests();
    switch (this.filterMode()) {
      case 'active':
        return list.filter(r => r.status !== 'Completed' && r.status !== 'Cancelled');
      case 'completed':
        return list.filter(r => r.status === 'Completed');
      default:
        return list;
    }
  });

  toggleSymptomTag(tag: string) {
    const current = this.selectedTags();
    if (current.includes(tag)) {
      this.selectedTags.set(current.filter(t => t !== tag));
    } else {
      this.selectedTags.set([...current, tag]);
    }
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags().includes(tag);
  }

  setSeverity(lvl: SeverityLevel) {
    this.selectedSeverity.set(lvl);
  }

  getSeverityClass(lvl: SeverityLevel): string {
    const isSelected = this.selectedSeverity() === lvl;
    switch (lvl) {
      case 'Mild':
        return isSelected
          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
          : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100';
      case 'Moderate':
        return isSelected
          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
          : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100';
      case 'Severe / Urgent':
        return isSelected
          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
          : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100';
    }
  }

  async submitRequest() {
    if (this.requestForm.invalid) return;

    this.isSubmitting.set(true);
    const val = this.requestForm.value;

    const fullSymptoms = this.selectedTags().length > 0
      ? `[${this.selectedTags().join(', ')}] ${val.symptoms}`
      : val.symptoms;

    try {
      await this.requestService.submitRequest({
        symptoms: fullSymptoms,
        symptomTags: this.selectedTags(),
        severity: this.selectedSeverity(),
        boardingAddress: val.boardingAddress,
        preferredSchedule: val.preferredSchedule
      });

      this.requestForm.patchValue({
        symptoms: ''
      });
      this.selectedTags.set([]);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  viewCertificate(request: HealthRequest) {
    this.selectedCertificateRequest.set(request);
  }

  downloadCertificate(request: HealthRequest) {
    this.pdfService.downloadCertificate(request);
  }

  getPipelinePercentage(status: RequestStatus): string {
    switch (status) {
      case 'Pending': return '0%';
      case 'Assigned': return '33%';
      case 'In Progress': return '66%';
      case 'Completed': return '100%';
      default: return '0%';
    }
  }

  getStepCircleClass(currentStatus: RequestStatus, step: RequestStatus): string {
    const order: RequestStatus[] = ['Pending', 'Assigned', 'In Progress', 'Completed'];
    const currentIdx = order.indexOf(currentStatus);
    const stepIdx = order.indexOf(step);

    if (currentIdx > stepIdx) {
      return 'bg-teal-600 text-white shadow-xs';
    } else if (currentIdx === stepIdx) {
      return 'bg-teal-600 text-white ring-4 ring-teal-100 shadow-xs scale-105';
    } else {
      return 'bg-slate-200 text-slate-500';
    }
  }

  formatDate(isoString: string): string {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
  }
}
