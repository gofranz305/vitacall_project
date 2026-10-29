import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RequestService } from '../../core/services/request.service';
import { AuthService } from '../../core/services/auth.service';
import { HealthRequest, RequestStatus } from '../../core/models/request.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { CertificateModalComponent } from '../../shared/components/certificate-modal.component';
import { PdfCertificateService } from '../../core/services/pdf-certificate.service';

@Component({
  selector: 'app-personnel-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StatusBadgeComponent, CertificateModalComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      <!-- Personnel Header & Quick Stats -->
      <div class="bg-gradient-to-r from-sky-900 via-sky-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/60 border border-sky-400/30 text-sky-200 text-xs font-semibold mb-3">
              <span>🚑</span>
              <span>Campus Health Dispatch Queue</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Medical Personnel Station
            </h1>
            <p class="text-sky-100/90 text-xs sm:text-sm mt-1 leading-relaxed">
              Logged in as <strong>{{ authService.currentUser()?.fullName || 'Health Officer' }}</strong> (Licensed Medical Personnel). Review student checkup requests, travel to boarding facilities, record clinical findings, and issue certified fit-to-study assessments.
            </p>
          </div>

          <!-- Quick Metrics Bar -->
          <div class="grid grid-cols-3 gap-2.5 sm:gap-3 bg-white/10 p-3 sm:p-4 rounded-2xl backdrop-blur-xs border border-white/15 shrink-0">
            <div class="text-center px-2">
              <span class="text-2xl sm:text-3xl font-extrabold text-amber-300 block">
                {{ requestService.stats().pending }}
              </span>
              <span class="text-[10px] text-sky-200 uppercase font-bold tracking-wider">Pending</span>
            </div>
            <div class="text-center px-2 border-x border-white/10">
              <span class="text-2xl sm:text-3xl font-extrabold text-sky-300 block">
                {{ requestService.stats().inProgress + requestService.stats().assigned }}
              </span>
              <span class="text-[10px] text-sky-200 uppercase font-bold tracking-wider">Active</span>
            </div>
            <div class="text-center px-2">
              <span class="text-2xl sm:text-3xl font-extrabold text-emerald-300 block">
                {{ requestService.stats().completed }}
              </span>
              <span class="text-[10px] text-sky-200 uppercase font-bold tracking-wider">Completed</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Queue Controls & Filters -->
      <div class="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <!-- Filter Tabs -->
        <div class="flex flex-wrap rounded-2xl bg-slate-100 p-1 text-xs font-semibold w-full sm:w-auto">
          <button
            type="button"
            (click)="queueTab.set('all')"
            class="px-3.5 py-2 rounded-xl transition-all"
            [ngClass]="queueTab() === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
          >
            All Requests ({{ requestService.requests().length }})
          </button>
          <button
            type="button"
            (click)="queueTab.set('pending')"
            class="px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
            [ngClass]="queueTab() === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
          >
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            Pending Queue ({{ requestService.stats().pending }})
          </button>
          <button
            type="button"
            (click)="queueTab.set('my_assigned')"
            class="px-3.5 py-2 rounded-xl transition-all"
            [ngClass]="queueTab() === 'my_assigned' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
          >
            My Assigned Cases
          </button>
          <button
            type="button"
            (click)="queueTab.set('completed')"
            class="px-3.5 py-2 rounded-xl transition-all"
            [ngClass]="queueTab() === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
          >
            Completed & Certified
          </button>
        </div>

        <!-- Search Bar -->
        <div class="w-full sm:w-64">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search student or address..."
            class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
      </div>

      <!-- Requests Queue Cards -->
      <div class="space-y-4">
        @if (filteredRequests().length === 0) {
          <div class="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <span class="text-4xl block mb-2">🎉</span>
            <h3 class="font-bold text-slate-800 text-sm">No Requests In This Queue</h3>
            <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no pending requests matching your current filter. Incoming health requests from boarding houses will display here in real-time.
            </p>
          </div>
        } @else {
          @for (req of filteredRequests(); track req.id) {
            <div
              class="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border transition-all hover:shadow-md"
              [ngClass]="req.severity === 'Severe / Urgent' && req.status !== 'Completed' ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200/90'"
            >
              <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                <!-- Student & Condition Info -->
                <div class="space-y-2 flex-1">
                  <!-- Header line with badges -->
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {{ req.id }}
                    </span>
                    <app-status-badge [status]="req.status" />
                    
                    @if (req.severity === 'Severe / Urgent') {
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                        ⚠️ URGENT CARE
                      </span>
                    }

                    <span class="text-xs text-slate-400">
                      • {{ formatDate(req.createdAt) }}
                    </span>
                  </div>

                  <!-- Student Name & Boarding House -->
                  <div>
                    <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>{{ req.studentName }}</span>
                      @if (req.studentContact) {
                        <a [href]="'tel:' + req.studentContact" class="text-xs font-medium text-sky-600 hover:underline">
                          📞 {{ req.studentContact }}
                        </a>
                      }
                    </h3>
                    <p class="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                      <span class="text-rose-500">📍</span>
                      <strong>Boarding Residence:</strong> {{ req.boardingAddress }}
                    </p>
                  </div>

                  <!-- Reported Symptoms & Tags -->
                  <div class="bg-slate-50 p-3 rounded-2xl border border-slate-200/70 text-xs">
                    <span class="font-semibold text-slate-700 block mb-1">Reported Symptoms:</span>
                    <p class="text-slate-800 leading-relaxed">{{ req.symptoms }}</p>
                    <div class="mt-2 text-[11px] text-slate-500">
                      Preferred Schedule: <strong class="text-slate-700">{{ req.preferredSchedule }}</strong>
                    </div>
                  </div>

                  <!-- Clinical Results Summary if Completed -->
                  @if (req.status === 'Completed') {
                    <div class="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-xs space-y-1">
                      <div class="text-emerald-900 font-bold">
                        Diagnosis: {{ req.diagnosis }}
                      </div>
                      <div class="text-emerald-800 text-[11px]">
                        Treatment: {{ req.treatment }}
                      </div>
                      <div class="text-emerald-700 text-[11px] font-mono">
                        Certificate Issued: {{ req.certificateId }}
                      </div>
                    </div>
                  }
                </div>

                <!-- Action Panel (Right Side) -->
                <div class="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  
                  <!-- If Pending: Personnel can Accept & Assign -->
                  @if (req.status === 'Pending') {
                    <button
                      type="button"
                      (click)="acceptRequest(req)"
                      class="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      <span>🚑 Accept & Dispatch to House</span>
                    </button>
                  }

                  <!-- If Assigned: Can Start Checkup -->
                  @if (req.status === 'Assigned') {
                    <div class="text-xs text-sky-800 font-medium mb-1">
                      Assigned to: <strong>{{ req.assignedPersonnelName }}</strong>
                    </div>
                    <button
                      type="button"
                      (click)="startCheckup(req)"
                      class="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      <span>🩺 Arrived / Start Checkup</span>
                    </button>
                  }

                  <!-- If In Progress: Open Clinical Entry Modal -->
                  @if (req.status === 'In Progress') {
                    <button
                      type="button"
                      (click)="openResultsModal(req)"
                      class="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 animate-bounce-subtle"
                    >
                      <span>📋 Record Diagnosis & Issue Cert</span>
                    </button>
                  }

                  <!-- If Completed: Download/Preview Certificate -->
                  @if (req.status === 'Completed') {
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        (click)="previewCertificate(req)"
                        class="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 transition-colors"
                      >
                        👁️ Preview Cert
                      </button>
                      <button
                        type="button"
                        (click)="downloadCertificate(req)"
                        class="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors flex items-center gap-1"
                      >
                        📥 PDF
                      </button>
                    </div>
                  }

                </div>

              </div>
            </div>
          }
        }
      </div>

    </div>

    <!-- Clinical Examination & Results Entry Modal -->
    @if (activeModalRequest()) {
      <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
        <div class="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
          
          <!-- Modal Header -->
          <div class="bg-gradient-to-r from-teal-700 via-sky-800 to-teal-900 text-white p-5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shadow-inner border border-white/20">
                🩺
              </div>
              <div>
                <h3 class="font-bold text-base leading-tight">Record Clinical Diagnosis</h3>
                <p class="text-xs text-sky-200">Patient: {{ activeModalRequest()?.studentName }} ({{ activeModalRequest()?.id }})</p>
              </div>
            </div>
            <button
              type="button"
              (click)="activeModalRequest.set(null)"
              class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm"
            >
              ✕
            </button>
          </div>

          <!-- Form Body -->
          <form [formGroup]="resultsForm" (ngSubmit)="submitResults()" class="p-6 overflow-y-auto space-y-4 text-xs">
            
            <!-- Quick Common Diagnoses Selector -->
            <div>
              <label class="block font-semibold text-slate-700 mb-1.5">Common Campus Diagnoses (Click to insert):</label>
              <div class="flex flex-wrap gap-1.5">
                @for (item of commonDiagnoses; track item) {
                  <button
                    type="button"
                    (click)="setDiagnosisPreset(item)"
                    class="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 transition-colors"
                  >
                    + {{ item }}
                  </button>
                }
              </div>
            </div>

            <!-- Diagnosis Field -->
            <div>
              <label class="block font-semibold text-slate-800 mb-1">
                Clinical Diagnosis: <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                formControlName="diagnosis"
                placeholder="e.g. Acute Viral Pharyngitis with Febrile Episode"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <!-- Vital Signs Row -->
            <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span class="font-bold text-slate-800 block mb-2">On-Site Vital Signs:</span>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label class="block text-[10px] text-slate-500 font-semibold mb-0.5">Temperature (°C)</label>
                  <input
                    type="text"
                    formControlName="temperature"
                    placeholder="38.5 °C"
                    class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-mono"
                  />
                </div>
                <div>
                  <label class="block text-[10px] text-slate-500 font-semibold mb-0.5">Blood Pressure</label>
                  <input
                    type="text"
                    formControlName="bloodPressure"
                    placeholder="120/80"
                    class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-mono"
                  />
                </div>
                <div>
                  <label class="block text-[10px] text-slate-500 font-semibold mb-0.5">Pulse Rate (bpm)</label>
                  <input
                    type="text"
                    formControlName="pulseRate"
                    placeholder="84 bpm"
                    class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-mono"
                  />
                </div>
                <div>
                  <label class="block text-[10px] text-slate-500 font-semibold mb-0.5">SpO2 Level</label>
                  <input
                    type="text"
                    formControlName="oxygenSat"
                    placeholder="98%"
                    class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <!-- Examination Observations -->
            <div>
              <label class="block font-semibold text-slate-800 mb-1">Clinical Findings & Observations:</label>
              <textarea
                rows="2"
                formControlName="medicalNotes"
                placeholder="Physical examination observations, throat erythema, chest auscultation findings..."
                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              ></textarea>
            </div>

            <!-- Treatment & Medications -->
            <div>
              <label class="block font-semibold text-slate-800 mb-1">
                Prescribed Treatment Regimen & Medications: <span class="text-rose-500">*</span>
              </label>
              <textarea
                rows="2"
                formControlName="treatment"
                placeholder="e.g. Paracetamol 500mg Q4H PRN for fever, Oral Rehydration Salts, abundant fluids..."
                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              ></textarea>
            </div>

            <!-- Excused Absence Days -->
            <div class="bg-amber-50 p-3 rounded-2xl border border-amber-200">
              <label class="block font-bold text-amber-950 mb-1">
                Recommended Bed Rest / Excused Absences:
              </label>
              <div class="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="14"
                  formControlName="restDaysRecommended"
                  class="w-24 px-3 py-1.5 bg-white border border-amber-300 rounded-lg font-bold text-amber-900 text-sm"
                />
                <span class="text-amber-800 text-xs">Consecutive Calendar Days (Will appear on official PDF)</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                (click)="activeModalRequest.set(null)"
                class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="isSavingResults() || resultsForm.invalid"
                class="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md transition-all flex items-center gap-1.5"
              >
                @if (isSavingResults()) {
                  <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Generating Certificate...</span>
                } @else {
                  <span>✓ Mark Completed & Issue Certificate</span>
                }
              </button>
            </div>

          </form>

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
export class PersonnelDashboardComponent {
  readonly authService = inject(AuthService);
  readonly requestService = inject(RequestService);
  private pdfService = inject(PdfCertificateService);
  private fb = inject(FormBuilder);

  queueTab = signal<'all' | 'pending' | 'my_assigned' | 'completed'>('all');
  searchQuery = '';
  activeModalRequest = signal<HealthRequest | null>(null);
  selectedCertificateRequest = signal<HealthRequest | null>(null);
  isSavingResults = signal<boolean>(false);

  commonDiagnoses: string[] = [
    'Acute Viral Pharyngitis with Febrile Episode',
    'Acute Gastroenteritis with Mild Dehydration',
    'Upper Respiratory Tract Infection (URTI)',
    'Tension Type Migraine / Acute Cephalea',
    'Bronchospasm / Mild Asthmatic Exacerbation'
  ];

  resultsForm: FormGroup = this.fb.group({
    diagnosis: ['Acute Viral Pharyngitis with Febrile Episode', Validators.required],
    temperature: ['38.6 °C'],
    bloodPressure: ['118/78 mmHg'],
    pulseRate: ['86 bpm'],
    oxygenSat: ['98%'],
    medicalNotes: ['Patient examined on-site in boarding facility. Mild tonsillar erythema, lungs clear. Hydration and antipyretics initiated.'],
    treatment: ['Paracetamol 500mg Q4H PRN, Oral Rehydration Salts, Vitamin C 500mg daily. Strict rest.'],
    restDaysRecommended: [3, [Validators.required, Validators.min(1)]]
  });

  readonly filteredRequests = computed(() => {
    let list = this.requestService.requests();
    const tab = this.queueTab();
    const user = this.authService.currentUser();

    if (tab === 'pending') {
      list = list.filter(r => r.status === 'Pending');
    } else if (tab === 'my_assigned') {
      list = list.filter(r => (r.status === 'Assigned' || r.status === 'In Progress') && (r.assignedPersonnelId === user?.uid || r.assignedPersonnelName === user?.fullName));
    } else if (tab === 'completed') {
      list = list.filter(r => r.status === 'Completed');
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(r =>
        r.studentName.toLowerCase().includes(q) ||
        r.boardingAddress.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        (r.diagnosis && r.diagnosis.toLowerCase().includes(q))
      );
    }

    return list;
  });

  acceptRequest(req: HealthRequest) {
    const user = this.authService.currentUser();
    this.requestService.acceptRequest(
      req.id,
      user?.uid || 'PERSONNEL-001',
      user?.fullName || 'Roberto Diaz, RN'
    );
  }

  startCheckup(req: HealthRequest) {
    this.requestService.updateStatus(req.id, 'In Progress', 'Health personnel arrived on-site at boarding residence');
  }

  openResultsModal(req: HealthRequest) {
    this.activeModalRequest.set(req);
    this.resultsForm.patchValue({
      diagnosis: req.diagnosis || 'Acute Viral Pharyngitis with Febrile Episode',
      temperature: req.vitals?.temperature || '38.4 °C',
      bloodPressure: req.vitals?.bloodPressure || '120/80 mmHg',
      pulseRate: req.vitals?.pulseRate || '82 bpm',
      oxygenSat: req.vitals?.oxygenSat || '98%',
      medicalNotes: req.medicalNotes || `Evaluated student at ${req.boardingAddress}. Vitals monitored.`,
      treatment: req.treatment || 'Paracetamol 500mg Q4H PRN for fever, Oral Rehydration Salts, warm saline gargle.',
      restDaysRecommended: req.restDaysRecommended || 3
    });
  }

  setDiagnosisPreset(diag: string) {
    this.resultsForm.patchValue({ diagnosis: diag });
  }

  async submitResults() {
    if (this.resultsForm.invalid || !this.activeModalRequest()) return;

    this.isSavingResults.set(true);
    const req = this.activeModalRequest()!;
    const val = this.resultsForm.value;

    try {
      const completed = await this.requestService.recordResultsAndComplete(req.id, {
        diagnosis: val.diagnosis,
        medicalNotes: val.medicalNotes,
        treatment: val.treatment,
        restDaysRecommended: val.restDaysRecommended,
        vitals: {
          temperature: val.temperature,
          bloodPressure: val.bloodPressure,
          pulseRate: val.pulseRate,
          oxygenSat: val.oxygenSat
        }
      });

      this.activeModalRequest.set(null);
      this.selectedCertificateRequest.set(completed);
    } finally {
      this.isSavingResults.set(false);
    }
  }

  previewCertificate(req: HealthRequest) {
    this.selectedCertificateRequest.set(req);
  }

  downloadCertificate(req: HealthRequest) {
    this.pdfService.downloadCertificate(req);
  }

  formatDate(isoString: string): string {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
  }
}
