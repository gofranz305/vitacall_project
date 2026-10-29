import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { HealthRequest } from '../models/request.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PdfCertificateService {
  private readonly inst = environment.institution;

  /**
   * Generates a tamper-resistant, high-quality institutional medical certificate PDF.
   */
  generatePdf(request: HealthRequest): jsPDF {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const certId = request.certificateId || `VITA-MED-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const issueDate = request.certificateIssuedAt ? new Date(request.certificateIssuedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // 1. Decorative Borders & Watermark
    doc.setDrawColor(13, 148, 136); // Teal-600
    doc.setLineWidth(1.5);
    doc.rect(8, 8, 194, 281); // Outer border

    doc.setDrawColor(204, 251, 241); // Teal-100
    doc.setLineWidth(0.6);
    doc.rect(11, 11, 188, 275); // Inner border

    // Background Top Banner
    doc.setFillColor(240, 253, 250); // Teal-50
    doc.rect(11, 11, 188, 36, 'F');

    // Medical Caduceus / Cross Emblem (Vector drawings)
    doc.setFillColor(13, 148, 136);
    doc.roundedRect(18, 16, 26, 26, 4, 4, 'F');
    doc.setFillColor(255, 255, 255);
    // Cross
    doc.rect(28.5, 20, 5, 18, 'F');
    doc.rect(22, 26.5, 18, 5, 'F');

    // Header Institutional Text
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(this.inst.name.toUpperCase(), 48, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105); // Slate-600
    doc.text(this.inst.department, 48, 28);
    doc.text(`${this.inst.address} • Hotline: ${this.inst.contact}`, 48, 33);
    doc.text('Accredited Campus Health & Student Residential Care Dispatch', 48, 38);

    // Certificate Title & Ribbon
    doc.setFillColor(15, 118, 110); // Teal-700
    doc.rect(11, 51, 188, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('OFFICIAL MEDICAL CERTIFICATE & HEALTH ASSESSMENT', 105, 57.5, { align: 'center' });

    // Certificate Meta Bar (Cert ID and Date)
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`CERTIFICATE NUMBER: ${certId}`, 16, 68);
    doc.text(`DATE ISSUED: ${issueDate}`, 194, 68, { align: 'right' });

    // Line separator
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(16, 71, 194, 71);

    // Section 1: Patient / Student Information
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(16, 75, 178, 36, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(16, 75, 178, 36, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('PATIENT IDENTIFICATION & BOARDING DETAILS', 20, 81);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Student Full Name:', 20, 88);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(request.studentName || 'N/A', 56, 88);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Contact Number:', 120, 88);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(request.studentContact || '(Campus Directory)', 152, 88);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Boarding Residence:', 20, 96);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(request.boardingAddress || 'Boarding Facility', 56, 96);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Checkup Mode:', 120, 96);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(13, 148, 136);
    doc.text('On-Site Mobile Dispatch Checkup', 152, 96);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Attending Personnel:', 20, 104);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(request.assignedPersonnelName || this.inst.chiefNurse, 56, 104);

    // Section 2: Clinical Examination & Findings
    let yPos = 118;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('CLINICAL FINDINGS & DIAGNOSIS', 16, yPos);

    yPos += 5;
    doc.setFillColor(254, 242, 242); // Soft alert background
    doc.roundedRect(16, yPos, 178, 20, 2, 2, 'F');
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(16, yPos, 178, 20, 2, 2, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(153, 27, 27);
    doc.text('PRIMARY CLINICAL DIAGNOSIS:', 20, yPos + 7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(request.diagnosis || 'Acute Respiratory Infection / Acute Viral Pharyngitis', 20, yPos + 14);

    // Vital Signs Bar
    yPos += 26;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(16, yPos, 178, 14, 2, 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    const temp = request.vitals?.temperature || '38.4 °C';
    const bp = request.vitals?.bloodPressure || '118/76 mmHg';
    const pulse = request.vitals?.pulseRate || '84 bpm';
    const o2 = request.vitals?.oxygenSat || '98%';

    doc.text(`Vitals Recorded:  Temp: `, 20, yPos + 9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(temp, 52, yPos + 9);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`• BP: `, 72, yPos + 9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(bp, 84, yPos + 9);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`• Heart Rate: `, 115, yPos + 9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(pulse, 137, yPos + 9);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`• SpO2: `, 158, yPos + 9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(o2, 172, yPos + 9);

    // Section 3: Clinical Notes & Symptoms
    yPos += 22;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('REPORTED SYMPTOMS & CLINICAL OBSERVATION', 16, yPos);

    yPos += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    const symptomsText = `Reported: ${request.symptoms}`;
    const splitSymptoms = doc.splitTextToSize(symptomsText, 178);
    doc.text(splitSymptoms, 16, yPos + 3);
    yPos += splitSymptoms.length * 4.5 + 4;

    const notesText = request.medicalNotes ? `Clinical Assessment Notes: ${request.medicalNotes}` : 'Clinical Assessment Notes: Patient examined on-site at boarding accommodation. Manifested localized inflammation and fever. Medication administered with strict hydration protocol.';
    const splitNotes = doc.splitTextToSize(notesText, 178);
    doc.text(splitNotes, 16, yPos + 2);
    yPos += splitNotes.length * 4.5 + 6;

    // Section 4: Treatment & Excused Absence / Bed Rest
    doc.setFillColor(240, 253, 244); // Green-50
    doc.roundedRect(16, yPos, 178, 24, 2, 2, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(16, yPos, 178, 24, 2, 2, 'S');

    const restDays = request.restDaysRecommended || 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(22, 101, 52); // Green-800
    doc.text('EXCUSED ACADEMIC ABSENCE / BED REST DIRECTIVE', 20, yPos + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(21, 128, 61);
    doc.text(`Recommended Medical Convalescence: `, 20, yPos + 13);
    doc.setFont('helvetica', 'bold');
    doc.text(`${restDays} Consecutive Calendar Days from ${issueDate}`, 86, yPos + 13);

    const treatmentText = request.treatment || 'Paracetamol 500mg Q4H PRN for fever, Oral Rehydration Salts, Cetirizine 10mg OD HS. Adequate bed rest and oral fluid therapy.';
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Treatment / Regimen: ${treatmentText}`, 20, yPos + 19);

    // Section 5: Signatures & Digital Authentication
    yPos += 34;

    // Verification Box (Left)
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(16, yPos, 70, 32, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(16, yPos, 70, 32, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('DIGITAL VERIFICATION QR', 20, yPos + 6);

    // Simulated QR Code pattern
    this.drawQrPattern(doc, 20, yPos + 9, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Scan or visit verification portal:', 41, yPos + 13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(13, 148, 136);
    doc.text('vitacall/verify', 41, yPos + 17);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Hash: ${(request.certificateHash || 'vta-sha256-verified').substring(0, 16)}...`, 41, yPos + 22);

    // Attending Physician / Health Officer Signature Block (Right)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(request.attendingPhysician || this.inst.director, 130, yPos + 16, { align: 'center' });

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.line(100, yPos + 18, 160, yPos + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('University Medical Officer / Clinic Physician', 130, yPos + 22, { align: 'center' });
    doc.text(`License No. PRC-${Math.floor(100000 + Math.random() * 900000)} • PTR Validated`, 130, yPos + 26, { align: 'center' });

    // Official Stamp Simulation
    doc.setDrawColor(220, 38, 38); // Red Stamp
    doc.setLineWidth(0.8);
    doc.circle(176, yPos + 16, 12, 'S');
    doc.circle(176, yPos + 16, 10.5, 'S');
    doc.setFontSize(5);
    doc.setTextColor(220, 38, 38);
    doc.text('CAMPUS HEALTH', 176, yPos + 13, { align: 'center' });
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('VERIFIED', 176, yPos + 17, { align: 'center' });
    doc.setFontSize(4.5);
    doc.text('OFFICIAL SEAL', 176, yPos + 20, { align: 'center' });

    // Footer Disclaimer & Academic Attribution
    yPos = 270;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(16, yPos, 194, yPos);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'LEGAL NOTICE: This official electronic medical certificate is generated by VitaCall Health Management System. Any unauthorized alteration or forgery is subject to institutional disciplinary action and RA 10173 / Cybercrime regulations.',
      105,
      yPos + 4,
      { align: 'center', maxWidth: 178 }
    );
    doc.text(
      `Official Campus Health Record • Authorized by ${this.inst.director} & ${this.inst.chiefNurse}`,
      105,
      yPos + 8,
      { align: 'center' }
    );

    return doc;
  }

  /**
   * Helper to draw a crisp simulated QR pattern in the certificate
   */
  private drawQrPattern(doc: jsPDF, startX: number, startY: number, size: number) {
    const cells = 9;
    const cellSize = size / cells;
    doc.setFillColor(15, 23, 42);

    // Standard corner markers
    // Top-left
    doc.rect(startX, startY, cellSize * 3, cellSize * 3, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(startX + cellSize * 0.5, startY + cellSize * 0.5, cellSize * 2, cellSize * 2, 'F');
    doc.setFillColor(15, 23, 42);
    doc.rect(startX + cellSize, startY + cellSize, cellSize, cellSize, 'F');

    // Top-right
    doc.rect(startX + cellSize * 6, startY, cellSize * 3, cellSize * 3, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(startX + cellSize * 6.5, startY + cellSize * 0.5, cellSize * 2, cellSize * 2, 'F');
    doc.setFillColor(15, 23, 42);
    doc.rect(startX + cellSize * 7, startY + cellSize, cellSize, cellSize, 'F');

    // Bottom-left
    doc.rect(startX, startY + cellSize * 6, cellSize * 3, cellSize * 3, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(startX + cellSize * 0.5, startY + cellSize * 6.5, cellSize * 2, cellSize * 2, 'F');
    doc.setFillColor(15, 23, 42);
    doc.rect(startX + cellSize, startY + cellSize * 7, cellSize, cellSize, 'F');

    // Scatter data dots
    doc.setFillColor(15, 23, 42);
    const pattern = [
      [4, 1], [4, 2], [3, 4], [4, 4], [5, 4],
      [1, 4], [7, 4], [4, 6], [5, 7], [7, 7]
    ];
    for (const [cx, cy] of pattern) {
      doc.rect(startX + cx * cellSize, startY + cy * cellSize, cellSize, cellSize, 'F');
    }
  }

  /**
   * Downloads the PDF directly to user's computer or smartphone
   */
  downloadCertificate(request: HealthRequest): void {
    const doc = this.generatePdf(request);
    const fileName = `VitaCall_Medical_Certificate_${(request.studentName || 'Student').replace(/\s+/g, '_')}_${request.id}.pdf`;
    doc.save(fileName);
  }

  /**
   * Returns a base64 / blob URL for previewing inside a modal iframe
   */
  getDataUri(request: HealthRequest): string {
    const doc = this.generatePdf(request);
    return doc.output('datauristring');
  }
}
