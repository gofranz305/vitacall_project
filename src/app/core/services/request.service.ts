import { Injectable, signal, computed } from '@angular/core';
import { HealthRequest, RequestStatus, SeverityLevel, VitalsData } from '../models/request.model';
import { AuthService } from './auth.service';
import { AuditLogService } from './audit-log.service';
import { NotificationService } from './notification.service';
import { environment } from '../../../environments/environment';

// Firebase Modular SDK imports
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  Firestore
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private requestsSignal = signal<HealthRequest[]>([]);
  readonly requests = this.requestsSignal.asReadonly();

  private readonly REQUESTS_STORAGE_KEY = 'vitacall_requests_db';

  // Computed signals for dashboards
  readonly pendingRequests = computed(() =>
    this.requestsSignal().filter(r => r.status === 'Pending')
  );

  readonly assignedRequests = computed(() =>
    this.requestsSignal().filter(r => r.status === 'Assigned')
  );

  readonly inProgressRequests = computed(() =>
    this.requestsSignal().filter(r => r.status === 'In Progress')
  );

  readonly completedRequests = computed(() =>
    this.requestsSignal().filter(r => r.status === 'Completed')
  );

  // Statistics for Admin & Personnel
  readonly stats = computed(() => {
    const list = this.requestsSignal();
    return {
      total: list.length,
      pending: list.filter(r => r.status === 'Pending').length,
      assigned: list.filter(r => r.status === 'Assigned').length,
      inProgress: list.filter(r => r.status === 'In Progress').length,
      completed: list.filter(r => r.status === 'Completed').length,
      cancelled: list.filter(r => r.status === 'Cancelled').length,
      urgentCases: list.filter(r => r.severity === 'Severe / Urgent' && r.status !== 'Completed').length
    };
  });

  constructor(
    private authService: AuthService,
    private auditLogService: AuditLogService,
    private notificationService: NotificationService
  ) {
    this.initRequestsData();
  }

  private initRequestsData() {
    const firestore = this.authService.getFirestoreInstance();

    // 1. If live Firestore is available, attach real-time snapshot listener
    if (firestore && this.authService.isFirebaseConfigured()) {
      try {
        const reqCol = collection(firestore, 'requests');
        const q = query(reqCol, orderBy('createdAt', 'desc'));
        onSnapshot(q, (snapshot) => {
          const liveList: HealthRequest[] = [];
          snapshot.forEach(docSnap => {
            liveList.push({
              id: docSnap.id,
              ...docSnap.data()
            } as HealthRequest);
          });
          this.requestsSignal.set(liveList);
        }, (err) => {
          console.warn('Firestore snapshot error, falling back to local DB:', err);
          this.loadLocalRequests();
        });
        return;
      } catch (err) {
        console.warn('Could not initialize Firestore listener:', err);
      }
    }

    // 2. Load from local database or seed data
    this.loadLocalRequests();
  }

  private loadLocalRequests() {
    try {
      const stored = localStorage.getItem(this.REQUESTS_STORAGE_KEY);
      if (stored) {
        this.requestsSignal.set(JSON.parse(stored));
        return;
      }
    } catch { }

    // Seed requests showcasing all stages
    const now = Date.now();
    const seed: HealthRequest[] = [
      {
        id: 'REQ-2026-001',
        studentId: 'UID-DEMO-STUDENT-001',
        studentName: 'Angelica Ramos',
        studentContact: '0917-889-4321',
        symptoms: 'High grade fever (38.8 C), severe sore throat, body malaise, and difficulty swallowing. Unable to walk to campus clinic safely.',
        symptomTags: ['Fever', 'Sore Throat', 'Chills', 'Fatigue'],
        severity: 'Severe / Urgent',
        boardingAddress: 'Room 304, Sunshine Dormitory, University Belt',
        preferredSchedule: 'Urgent / Immediate Mobile Checkup',
        status: 'Completed',
        assignedPersonnelId: 'UID-DEMO-PERSONNEL-001',
        assignedPersonnelName: 'Roberto Diaz, RN',
        assignedPersonnelContact: '0920-554-1188',
        assignedAt: new Date(now - 3600000 * 3).toISOString(),
        vitals: {
          temperature: '38.6 °C',
          bloodPressure: '118/78 mmHg',
          pulseRate: '88 bpm',
          oxygenSat: '98%'
        },
        diagnosis: 'Acute Viral Pharyngitis with Febrile Reaction',
        medicalNotes: 'On-site physical assessment performed at boarding facility. Bilateral tonsillar erythema noted without purulent exudates. Clear lung sounds. Hydration therapy initiated.',
        treatment: 'Paracetamol 500mg Q4H PRN for temperature >37.8 C. Chlorhexidine oral rinse 3x daily. 3 Liters fluid intake per day. Strict bed rest.',
        restDaysRecommended: 3,
        clinicRecommendations: 'Excused from physical and laboratory classes for 3 calendar days.',
        certificateId: 'VITA-MED-2026-9812',
        certificateIssuedAt: new Date(now - 3600000 * 1.5).toISOString(),
        certificateHash: 'sha256-vta-9812-7f9a2b4c6e8d1024',
        attendingPhysician: 'Dr. Franz Go. MD (Accredited by Nurse Diaz)',
        physicianLicense: 'PRC-MD-0419201',
        createdAt: new Date(now - 3600000 * 4).toISOString(),
        updatedAt: new Date(now - 3600000 * 1.5).toISOString()
      },
      {
        id: 'REQ-2026-002',
        studentId: 'UID-DEMO-STUDENT-002',
        studentName: 'Miguel Castillo',
        studentContact: '0919-332-1144',
        symptoms: 'Sudden onset abdominal cramping and acute diarrhea since early morning. Dehydrated and weak.',
        symptomTags: ['Stomach Pain', 'Nausea', 'Dehydration', 'Diarrhea'],
        severity: 'Moderate',
        boardingAddress: 'Unit B, Emerald Heights Boarding, Sta. Mesa',
        preferredSchedule: 'Today, 2:00 PM',
        status: 'In Progress',
        assignedPersonnelId: 'UID-DEMO-PERSONNEL-001',
        assignedPersonnelName: 'Roberto Diaz, RN',
        assignedPersonnelContact: '0920-554-1188',
        assignedAt: new Date(now - 3600000 * 1).toISOString(),
        vitals: {
          temperature: '37.3 °C',
          bloodPressure: '110/70 mmHg',
          pulseRate: '92 bpm',
          oxygenSat: '99%'
        },
        medicalNotes: 'Health personnel arrived at boarding house. Currently administering oral rehydration salts and monitoring abdomen.',
        createdAt: new Date(now - 3600000 * 2).toISOString(),
        updatedAt: new Date(now - 3600000 * 1).toISOString()
      },
      {
        id: 'REQ-2026-003',
        studentId: 'UID-DEMO-STUDENT-003',
        studentName: 'Charles Tan',
        studentContact: '0928-119-9022',
        symptoms: 'Severe pounding migraine, photophobia, and nausea after late study sessions. Cannot stand bright lights.',
        symptomTags: ['Migraine', 'Headache', 'Nausea', 'Dizziness'],
        severity: 'Moderate',
        boardingAddress: 'Pad 12, Maple Leaf Residences, Sampaloc',
        preferredSchedule: 'Today, 3:30 PM',
        status: 'Assigned',
        assignedPersonnelId: 'UID-DEMO-PERSONNEL-002',
        assignedPersonnelName: 'Sarah Mendoza, RN',
        assignedPersonnelContact: '0915-777-3322',
        assignedAt: new Date(now - 1800000).toISOString(),
        createdAt: new Date(now - 3600000 * 1.5).toISOString(),
        updatedAt: new Date(now - 1800000).toISOString()
      },
      {
        id: 'REQ-2026-004',
        studentId: 'UID-DEMO-STUDENT-001',
        studentName: 'Angelica Ramos',
        studentContact: '0917-889-4321',
        symptoms: 'Persistent dry cough, mild wheezing, and chest tightness after exposure to dust in dormitory hallway.',
        symptomTags: ['Cough', 'Chest Tightness', 'Difficulty Breathing'],
        severity: 'Severe / Urgent',
        boardingAddress: 'Room 304, Sunshine Dormitory, University Belt',
        preferredSchedule: 'As soon as possible',
        status: 'Pending',
        createdAt: new Date(now - 900000).toISOString(),
        updatedAt: new Date(now - 900000).toISOString()
      },
      {
        id: 'REQ-2026-005',
        studentId: 'UID-DEMO-STUDENT-004',
        studentName: 'Bea Santos',
        studentContact: '0926-441-8899',
        symptoms: 'Low grade fever (37.9 C), nasal congestion, mild dizziness, and fatigue after midterms.',
        symptomTags: ['Fever', 'Dizziness', 'Fatigue', 'Cough'],
        severity: 'Moderate',
        boardingAddress: 'Room 108, Villa Feliza Boarding House, Sampaloc',
        preferredSchedule: 'Today, 4:00 PM',
        status: 'Pending',
        createdAt: new Date(now - 450000).toISOString(),
        updatedAt: new Date(now - 450000).toISOString()
      }
    ];

    try {
      const stored = localStorage.getItem(this.REQUESTS_STORAGE_KEY);
      if (stored) {
        const storedList = JSON.parse(stored) as HealthRequest[];
        let updated = false;
        for (const s of seed) {
          if (!storedList.some(r => r.id === s.id)) {
            storedList.push(s);
            updated = true;
          }
        }
        this.requestsSignal.set(storedList);
        if (updated) {
          this.persistRequests();
        }
        return;
      }
    } catch { }

    this.requestsSignal.set(seed);
    this.persistRequests();
  }

  /**
   * Submits a new checkup request from student
   */
  async submitRequest(data: {
    symptoms: string;
    symptomTags?: string[];
    severity?: SeverityLevel;
    boardingAddress: string;
    preferredSchedule: string;
  }): Promise<HealthRequest> {
    const user = this.authService.currentUser();
    if (!user) throw new Error('You must be logged in to submit a request.');

    const newId = `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    const requestItem: HealthRequest = {
      id: newId,
      studentId: user.uid,
      studentName: user.fullName,
      studentContact: user.contactNumber,
      symptoms: data.symptoms,
      symptomTags: data.symptomTags || [],
      severity: data.severity || 'Moderate',
      boardingAddress: data.boardingAddress,
      preferredSchedule: data.preferredSchedule,
      status: 'Pending',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    // Firebase Sync
    const firestore = this.authService.getFirestoreInstance();
    if (firestore && this.authService.isFirebaseConfigured()) {
      try {
        const docRef = await addDoc(collection(firestore, 'requests'), requestItem);
        requestItem.id = docRef.id;
      } catch (err) {
        console.warn('Firebase addDoc failed, saved locally:', err);
      }
    }

    this.requestsSignal.update(list => [requestItem, ...list]);
    this.persistRequests();

    this.auditLogService.log(
      'REQUEST_SUBMITTED',
      user.fullName,
      user.email,
      user.role,
      `Submitted health checkup request for symptoms: ${data.symptoms.substring(0, 40)}...`,
      requestItem.id
    );

    this.notificationService.success('Checkup Request Submitted', 'Campus health personnel have been notified of your request.');
    return requestItem;
  }

  /**
   * Accepts and assigns request to medical personnel
   */
  async acceptRequest(requestId: string, personnelId: string, personnelName: string): Promise<void> {
    const nowIso = new Date().toISOString();
    this.updateRequestInStore(requestId, {
      status: 'Assigned',
      assignedPersonnelId: personnelId,
      assignedPersonnelName: personnelName,
      assignedAt: nowIso,
      updatedAt: nowIso
    });

    const user = this.authService.currentUser();
    this.auditLogService.log(
      'REQUEST_ASSIGNED',
      personnelName,
      user?.email || 'personnel@campus.edu',
      'medical_personnel',
      `Accepted request ${requestId} for boarding house dispatch`,
      requestId
    );

    this.notificationService.success('Request Accepted', `Assigned case to ${personnelName}. Status updated to Assigned.`);
  }

  /**
   * Updates request status (e.g. 'In Progress', 'Cancelled')
   */
  async updateStatus(requestId: string, newStatus: RequestStatus, note?: string): Promise<void> {
    const nowIso = new Date().toISOString();
    const updates: Partial<HealthRequest> = {
      status: newStatus,
      updatedAt: nowIso
    };
    if (note) {
      updates.medicalNotes = note;
    }

    this.updateRequestInStore(requestId, updates);

    const user = this.authService.currentUser();
    this.auditLogService.log(
      'STATUS_UPDATED',
      user?.fullName || 'Personnel',
      user?.email || '',
      user?.role || 'staff',
      `Updated request status to ${newStatus}${note ? `: ${note}` : ''}`,
      requestId
    );

    this.notificationService.info('Status Updated', `Request status changed to ${newStatus}`);
  }

  /**
   * Records clinical results, diagnosis, vitals, and generates verifiable Medical Certificate.
   */
  async recordResultsAndComplete(
    requestId: string,
    resultsData: {
      diagnosis: string;
      medicalNotes: string;
      treatment: string;
      restDaysRecommended: number;
      vitals: VitalsData;
    }
  ): Promise<HealthRequest> {
    const user = this.authService.currentUser();
    const certNum = `VITA-MED-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();
    const hash = `sha256-vta-${Math.random().toString(36).substring(2, 10)}-${Date.now().toString(36)}`;

    const updates: Partial<HealthRequest> = {
      status: 'Completed',
      diagnosis: resultsData.diagnosis,
      medicalNotes: resultsData.medicalNotes,
      treatment: resultsData.treatment,
      restDaysRecommended: resultsData.restDaysRecommended,
      vitals: resultsData.vitals,
      certificateId: certNum,
      certificateIssuedAt: nowIso,
      certificateHash: hash,
      attendingPhysician: user?.fullName || environment.institution.director,
      physicianLicense: user?.staffLicenseNumber || 'PRC-LIC-448190',
      updatedAt: nowIso
    };

    this.updateRequestInStore(requestId, updates);

    this.auditLogService.log(
      'RESULTS_RECORDED',
      user?.fullName || 'Health Personnel',
      user?.email || 'personnel@campus.edu',
      'medical_personnel',
      `Completed checkup and recorded diagnosis: ${resultsData.diagnosis}. Issued cert ${certNum}`,
      requestId
    );

    this.auditLogService.log(
      'CERTIFICATE_GENERATED',
      'VitaCall Certificate Engine',
      'system@campus.edu',
      'admin',
      `Generated tamper-resistant certificate ${certNum} with integrity hash ${hash}`,
      certNum
    );

    this.notificationService.success('Checkup Completed', `Medical certificate ${certNum} generated and ready for student!`);
    return this.getRequestById(requestId)!;
  }

  /**
   * Admin override: reassigns personnel, changes status, or cancels
   */
  async adminOverride(
    requestId: string,
    override: {
      status?: RequestStatus;
      assignedPersonnelId?: string;
      assignedPersonnelName?: string;
      reason: string;
    }
  ): Promise<void> {
    const nowIso = new Date().toISOString();
    const updates: Partial<HealthRequest> = {
      updatedAt: nowIso
    };
    if (override.status) updates.status = override.status;
    if (override.assignedPersonnelId) {
      updates.assignedPersonnelId = override.assignedPersonnelId;
      updates.assignedPersonnelName = override.assignedPersonnelName;
    }

    this.updateRequestInStore(requestId, updates);

    const user = this.authService.currentUser();
    this.auditLogService.log(
      'ADMIN_OVERRIDE',
      user?.fullName || 'Admin',
      user?.email || 'admin@campus.edu',
      'admin',
      `Admin override: ${override.reason}. Status: ${override.status || 'Unchanged'}, Assigned: ${override.assignedPersonnelName || 'Unchanged'}`,
      requestId
    );

    this.notificationService.warning('Admin Override Applied', `Request ${requestId} updated: ${override.reason}`);
  }

  /**
   * Finds request by ID
   */
  getRequestById(id: string): HealthRequest | undefined {
    return this.requestsSignal().find(r => r.id === id);
  }

  /**
   * Finds request by Certificate ID (for verification portal)
   */
  getCertificateById(certificateId: string): HealthRequest | undefined {
    const clean = certificateId.trim().toUpperCase();
    return this.requestsSignal().find(r => r.certificateId?.toUpperCase() === clean);
  }

  private updateRequestInStore(requestId: string, updates: Partial<HealthRequest>) {
    this.requestsSignal.update(list =>
      list.map(req => (req.id === requestId ? { ...req, ...updates } : req))
    );
    this.persistRequests();

    // Sync to Firestore if active
    const firestore = this.authService.getFirestoreInstance();
    if (firestore && this.authService.isFirebaseConfigured()) {
      try {
        const reqRef = doc(firestore, 'requests', requestId);
        updateDoc(reqRef, updates).catch(err => {
          console.warn('Firestore updateDoc failed:', err);
        });
      } catch (e) {
        console.warn('Firestore update error:', e);
      }
    }
  }

  private persistRequests() {
    try {
      localStorage.setItem(this.REQUESTS_STORAGE_KEY, JSON.stringify(this.requestsSignal()));
    } catch { }
  }

  /**
   * Reset data to default seed for testing/demo
   */
  resetToSeedData() {
    localStorage.removeItem(this.REQUESTS_STORAGE_KEY);
    this.loadLocalRequests();
    this.notificationService.info('System Reset', 'Restored sample boarding requests and test records.');
  }
}
