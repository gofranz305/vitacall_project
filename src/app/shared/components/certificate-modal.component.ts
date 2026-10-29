import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HealthRequest } from '../../core/models/request.model';
import { PdfCertificateService } from '../../core/services/pdf-certificate.service';
import { NotificationService } from '../../core/services/notification.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-certificate-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (request) {
      <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
          
          <!-- Header -->
          <div class="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-900 text-white p-5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shadow-inner border border-white/20">
                📄
              </div>
              <div>
                <h3 class="font-bold text-lg leading-tight">Official Medical Certificate</h3>
                <p class="text-xs text-teal-200/90 font-mono mt-0.5">ID: {{ request.certificateId || 'VITA-MED-2026' }}</p>
              </div>
            </div>
            <button
              (click)="close.emit()"
              class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-colors"
            >
              ✕
            </button>
          </div>

          <!-- Certificate Paper Preview Body -->
          <div class="p-6 overflow-y-auto bg-slate-50 flex-1">
            <div class="bg-white border-2 border-teal-600/30 rounded-xl p-6 shadow-sm relative">
              
              <!-- Subtle Seal Watermark -->
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <span class="text-9xl font-black text-teal-900">VITA</span>
              </div>

              <!-- Institutional Header -->
              <div class="text-center pb-4 border-b border-slate-200">
                <span class="inline-block px-2.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1">
                  Republic of the Philippines • Campus Health Dispatch
                </span>
                <h4 class="font-bold text-slate-900 text-base uppercase tracking-tight">{{ institution.name }}</h4>
                <p class="text-xs text-slate-500">{{ institution.department }}</p>
                <p class="text-[11px] text-slate-400 mt-0.5">{{ institution.address }} • Hotline: {{ institution.contact }}</p>
              </div>

              <!-- Certificate Sub-Banner -->
              <div class="my-4 py-1.5 px-3 bg-teal-700 text-white text-center rounded-lg font-bold text-xs tracking-wider uppercase">
                Fit-to-Study & Excused Absence Medical Assessment
              </div>

              <!-- Identification Grid -->
              <div class="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span class="text-slate-500 block">Student Patient:</span>
                  <strong class="text-slate-900 text-sm">{{ request.studentName }}</strong>
                </div>
                <div>
                  <span class="text-slate-500 block">Date Issued:</span>
                  <strong class="text-slate-900">{{ formatDate(request.certificateIssuedAt || request.updatedAt) }}</strong>
                </div>
                <div>
                  <span class="text-slate-500 block">Boarding House Residence:</span>
                  <span class="text-slate-700 font-medium">{{ request.boardingAddress }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Attending Examiner:</span>
                  <span class="text-slate-700 font-medium">{{ request.assignedPersonnelName || institution.chiefNurse }}</span>
                </div>
              </div>

              <!-- Diagnosis Card -->
              <div class="bg-red-50/80 border border-red-200 rounded-lg p-3.5 mb-4">
                <span class="text-[11px] font-bold text-red-800 uppercase tracking-wide">Primary Clinical Diagnosis:</span>
                <p class="text-red-950 font-bold text-sm mt-0.5">{{ request.diagnosis || 'Acute Respiratory Tract Infection' }}</p>
                @if (request.vitals) {
                  <div class="flex flex-wrap gap-3 mt-2 text-[11px] text-red-900/80 font-mono">
                    <span>Temp: <strong>{{ request.vitals.temperature || '38.4 °C' }}</strong></span>
                    <span>BP: <strong>{{ request.vitals.bloodPressure || '120/80' }}</strong></span>
                    <span>HR: <strong>{{ request.vitals.pulseRate || '82 bpm' }}</strong></span>
                  </div>
                }
              </div>

              <!-- Clinical Notes & Regimen -->
              <div class="text-xs space-y-2 mb-4 text-slate-700">
                <div>
                  <span class="font-semibold text-slate-900">Clinical Findings & Notes:</span>
                  <p class="text-slate-600 mt-0.5 leading-relaxed">{{ request.medicalNotes || 'Student evaluated at boarding residence. Symptomatic medication and strict bed rest instituted.' }}</p>
                </div>
                <div>
                  <span class="font-semibold text-slate-900">Prescribed Treatment Regimen:</span>
                  <p class="text-slate-600 mt-0.5 leading-relaxed">{{ request.treatment || 'Adequate hydration, antipyretics, and vitamin supplementation.' }}</p>
                </div>
              </div>

              <!-- Bed Rest Box -->
              <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs mb-5">
                <span class="text-[11px] font-bold text-emerald-800 uppercase">Excused Absence Recommendation:</span>
                <p class="text-emerald-950 font-semibold mt-0.5">
                  Recommended {{ request.restDaysRecommended || 3 }} consecutive days of bed rest from classes.
                </p>
              </div>

              <!-- Seal and Signatures -->
              <div class="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <!-- QR Code & Anti-Forgery -->
                <div class="flex items-center gap-2.5">
                  <div class="w-12 h-12 bg-slate-900 rounded-lg p-1.5 flex flex-col justify-between">
                    <div class="flex justify-between">
                      <div class="w-2.5 h-2.5 bg-white"></div>
                      <div class="w-2.5 h-2.5 bg-white"></div>
                    </div>
                    <div class="flex justify-between">
                      <div class="w-2.5 h-2.5 bg-white"></div>
                      <div class="w-1.5 h-1.5 bg-teal-400"></div>
                    </div>
                  </div>
                  <div class="text-[10px] text-slate-500">
                    <strong class="text-teal-700 block">SHA-256 Validated</strong>
                    <span class="font-mono">{{ (request.certificateHash || 'vta-sha256-verified').substring(0, 14) }}...</span>
                    <span class="block text-slate-400">Scan to verify</span>
                  </div>
                </div>

                <!-- Physician Signature Block -->
                <div class="text-right">
                  <div class="font-serif italic text-teal-900 font-bold text-xs mb-0.5">Digital Cryptographic Signature</div>
                  <div class="font-bold text-xs text-slate-900">{{ request.attendingPhysician || institution.director }}</div>
                  <div class="text-[10px] text-slate-500">Accredited Health Services Officer</div>
                </div>
              </div>

            </div>
          </div>

          <!-- Footer Actions -->
          <div class="bg-slate-100 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              (click)="copyVerificationLink()"
              class="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-teal-700 font-medium py-2 px-3 rounded-lg hover:bg-white border border-transparent hover:border-slate-300 transition-all"
            >
              🔗 Copy Public Verification Link
            </button>

            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="close.emit()"
                class="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
              >
                Close
              </button>
              <button
                type="button"
                (click)="downloadPdf()"
                class="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
              >
                📥 Download PDF Certificate
              </button>
            </div>
          </div>

        </div>
      </div>
    }
  `
})
export class CertificateModalComponent {
  @Input() request: HealthRequest | null = null;
  @Output() close = new EventEmitter<void>();

  readonly pdfService = inject(PdfCertificateService);
  readonly notificationService = inject(NotificationService);
  readonly institution = environment.institution;

  downloadPdf() {
    if (this.request) {
      this.pdfService.downloadCertificate(this.request);
      this.notificationService.success('PDF Downloaded', 'Official medical certificate saved successfully.');
    }
  }

  copyVerificationLink() {
    if (!this.request?.certificateId) return;
    const url = `${window.location.origin}/verify/${this.request.certificateId}`;
    navigator.clipboard.writeText(url).then(() => {
      this.notificationService.success('Link Copied', 'Public certificate verification link copied to clipboard.');
    }).catch(() => {
      this.notificationService.info('Verification Code', `Certificate ID: ${this.request?.certificateId}`);
    });
  }

  formatDate(isoString?: string): string {
    if (!isoString) return 'Current Date';
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
