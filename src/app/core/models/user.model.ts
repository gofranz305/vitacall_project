export type UserRole = 'student' | 'medical_personnel' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  fullName: string;
  contactNumber: string;
  boardingAddress?: string; // primarily for students
  studentIdNumber?: string; // student ID
  staffLicenseNumber?: string; // for medical personnel
  departmentOrCourse?: string;
  avatarUrl?: string;
  avatarIcon?: string;
  badge?: string;
  createdAt: string;
  status: 'active' | 'suspended';
  password?: string;
}

export interface DemoAccount {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
  contactNumber: string;
  boardingAddress?: string;
  studentIdNumber?: string;
  staffLicenseNumber?: string;
  title: string;
  description: string;
  avatarIcon: string;
  badge: string;
}

