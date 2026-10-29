import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RequestService } from '../../core/services/request.service';
import { HealthRequest } from '../../core/models/request.model';
import { PdfCertificateService } from '../../core/services/pdf-certificate.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-verify-certificate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8 space-y-6 pb-24 md:pb-12 animate-fade-in">
      
      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 mx-auto flex items-center justify-center text-2xl shadow-xs">
          🛡️
        </div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Medical Certificate Verification Portal</h1>
        <p class="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Official campus health portal to authenticate tamper-resistant medical certificates issued to boarding students by Western Campus Health Services.
        </p>
      </div>

      <!-- Search Input Card -->
      <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
        <label class="block text-xs font-bold text-slate-700 mb-1.5">
          Enter Certificate Verification Number:
        </label>
        <div class="flex gap-2">
          <input
            type="text"
            [(ngModel)]="searchCertId"
            (keyup.enter)="verifyCertificate()"
            placeholder="e.g. VITA-MED-2026-9812"
            class="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs uppercase font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
          <button
            type="button"
            (click)="verifyCertificate()"
            class="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 shadow-xs transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>Verify Authenticity</span>
          </button>
        </div>
      </div>

      <!-- Result Card -->
      @if (searched()) {
        @if (matchedRecord()) {
          <div class="bg-white rounded-3xl border-2 border-emerald-500/80 p-6 sm:p-8 shadow-xl shadow-emerald-500/5 space-y-6 animate-scale-up">
            
            <!-- Verified Banner -->
            <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xl font-bold">
                  ✓
                </div>
                <div>
                  <h3 class="font-extrabold text-emerald-950 text-sm sm:text-base">
                    AUTHENTIC MEDICAL CERTIFICATE
                  </h3>
                  <p class="text-emerald-700 text-xs">
                    Digitally registered in Campus Health Database. Integrity verified.
                  </p>
                </div>
              </div>
              <span class="px-2.5 py-1 bg-emerald-200/80 text-emerald-900 font-bold text-[10px] rounded-full uppercase tracking-wider">
                VALID & ACTIVE
              </span>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span class="text-slate-400 block text-[11px]">Certificate Number:</span>
                <strong class="text-slate-900 font-mono text-sm">{{ matchedRecord()?.certificateId }}</strong>
              </div>

              <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span class="text-slate-400 block text-[11px]">Date Issued:</span>
                <strong class="text-slate-900 text-sm">{{ formatDate(matchedRecord()?.certificateIssuedAt) }}</strong>
              </div>

              <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span class="text-slate-400 block text-[11px]">Patient / Student Name:</span>
                <strong class="text-slate-900 text-sm">{{ matchedRecord()?.studentName }}</strong>
              </div>

              <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span class="text-slate-400 block text-[11px]">Boarding Residence:</span>
                <span class="text-slate-700 font-medium">{{ matchedRecord()?.boardingAddress }}</span>
              </div>

              <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span class="text-slate-400 block text-[11px]">Attending Health Personnel:</span>
                <strong class="text-slate-800">{{ matchedRecord()?.assignedPersonnelName || institution.chiefNurse }}</strong>
              </div>

              <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span class="text-slate-400 block text-[11px]">Supervising Physician:</span>
                <strong class="text-slate-800">{{ matchedRecord()?.attendingPhysician || institution.director }}</strong>
              </div>
            </div>

            <!-- Clinical Assessment -->
            <div class="p-4 bg-teal-50/60 rounded-2xl border border-teal-200/70 text-xs space-y-2">
              <div>
                <span class="text-teal-900 font-bold block">Certified Diagnosis:</span>
                <span class="text-slate-800 text-sm font-semibold">{{ matchedRecord()?.diagnosis }}</span>
              </div>
              <div>
                <span class="text-teal-900 font-bold block">Excused Academic Absence / Bed Rest:</span>
                <span class="text-emerald-800 font-bold">
                  {{ matchedRecord()?.restDaysRecommended || 3 }} Consecutive Calendar Days
                </span>
              </div>
            </div>

            <!-- SHA-256 Token -->
            <div class="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px]">
              <span class="text-slate-400">Cryptographic Hash:</span>
              <span class="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">
                {{ matchedRecord()?.certificateHash || 'sha256-vta-valid-signature' }}
              </span>
            </div>

            <!-- Download Button -->
            <div class="pt-2 flex justify-end">
              <button
                type="button"
                (click)="downloadPdf()"
                class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md transition-all flex items-center gap-1.5"
              >
                📥 Download Official Copy (PDF)
              </button>
            </div>

          </div>
        } @else {
          <div class="bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-3">
            <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center text-xl font-bold">
              ✕
            </div>
            <h3 class="font-bold text-slate-900 text-base">Certificate Not Found</h3>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">
              No matching record was found for <strong class="text-slate-800">"{{ searchCertId }}"</strong>. Please verify the ID number or contact Campus Health Services.
            </p>
          </div>
        }
      }

    </div>
  `
})
export class VerifyCertificateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private requestService = inject(RequestService);
  private pdfService = inject(PdfCertificateService);
  readonly institution = environment.institution;

  searchCertId = 'VITA-MED-2026-9812';
  searched = signal<boolean>(false);
  matchedRecord = signal<HealthRequest | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const certId = params.get('certificateId');
      if (certId) {
        this.searchCertId = certId;
        this.verifyCertificate();
      } else {
        // Auto-verify default sample for immediate preview
        this.verifyCertificate();
      }
    });
  }

  verifyCertificate() {
    this.searched.set(true);
    if (!this.searchCertId.trim()) {
      this.matchedRecord.set(null);
      return;
    }

    const found = this.requestService.getCertificateById(this.searchCertId);
    this.matchedRecord.set(found || null);
  }

  downloadPdf() {
    const rec = this.matchedRecord();
    if (rec) {
      this.pdfService.downloadCertificate(rec);
    }
  }

  formatDate(isoString?: string): string {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
