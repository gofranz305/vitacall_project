export type RequestStatus = 'Pending' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';
export type SeverityLevel = 'Mild' | 'Moderate' | 'Severe / Urgent';

export interface VitalsData {
  temperature?: string; // e.g. "38.6 °C"
  bloodPressure?: string; // e.g. "120/80 mmHg"
  pulseRate?: string; // e.g. "86 bpm"
  oxygenSat?: string; // e.g. "98%"
}

export interface HealthRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentContact?: string;
  symptoms: string;
  symptomTags?: string[];
  severity?: SeverityLevel;
  boardingAddress: string;
  preferredSchedule: string;
  status: RequestStatus;
  
  // Personnel assignment
  assignedPersonnelId?: string;
  assignedPersonnelName?: string;
  assignedPersonnelContact?: string;
  assignedAt?: string;
  
  // Clinical examination results (recorded by medical personnel)
  vitals?: VitalsData;
  diagnosis?: string;
  medicalNotes?: string;
  treatment?: string;
  restDaysRecommended?: number;
  clinicRecommendations?: string;
  
  // Certificate metadata
  certificateId?: string;
  certificateIssuedAt?: string;
  certificateHash?: string;
  attendingPhysician?: string;
  physicianLicense?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface RequestFilter {
  status?: RequestStatus | 'All';
  searchQuery?: string;
  severity?: SeverityLevel | 'All';
  assignedPersonnelId?: string;
}
