# 🩺 VitaCall: Mobile-Accessible Health Request & Monitoring System for Boarding Students

> **Campus Health Services • VitaCall Portal**  
> *Medical Director: Dr. Franz Go. MD*

---

## 🌟 Overview & Problem Context
College students living away from family in off-campus boarding houses and dormitories face significant challenges when falling ill:
- **Lack of transportation & companion** to physically reach the campus clinic while weak.
- **Informal, undocumented request flow** (untracked SMS/calls easy to lose).
- **Clinic attendance hurdles**: Clinics typically require physical walk-in visits before issuing medical certificates.
- **Data Protection & Tamper Resistance**: Health data and absence certificates require strict Information Assurance & Security (IAS) controls, role-based access, and anti-forgery mechanisms.

**VitaCall** provides a mobile-accessible, role-based platform enabling boarding students to submit checkup requests from their residence, health personnel to dispatch, conduct on-site checkups, and record clinical diagnoses, and an automated engine to issue tamper-resistant PDF medical certificates with SHA-256 verification.

---

## 🚀 Tech Stack
- **Frontend Framework**: Angular 22 (Standalone Components, Reactive Forms, Signals & RxJS, Route Guards)
- **Styling**: Tailwind CSS v4 (Mobile-first ergonomic design, responsive bottom navigation bar, card aesthetics)
- **Backend & Database**: Firebase Modular Web SDK v11 (Firebase Authentication & Cloud Firestore)
- **PDF Generation**: `jspdf` (Tamper-resistant institutional medical certificates with dynamic digital stamp, QR verification, and SHA-256 integrity hash)
- **Security & RBAC**: Information Assurance & Security (IAS) audit trail, role-based guards (`student`, `medical_personnel`, `admin`)

---

## 👥 User Roles & Access Control

| Role | Default Demo Account | Permissions & Dashboard URL |
| :--- | :--- | :--- |
| **Boarding Student** | `student@campus.edu` | `/student/dashboard` — Submit checkup requests, track live pipeline (`Pending` ➔ `Assigned` ➔ `In Progress` ➔ `Completed`), and preview/download PDF medical certificates. |
| **Medical Personnel** | `personnel@campus.edu` | `/personnel/dashboard` — View incoming boarding house request queue, accept/assign to self, dispatch, record clinical vitals/diagnosis/treatment, and complete checkup to issue certificates. |
| **Administrator** | `admin@campus.edu` | `/admin/dashboard` — System statistics (total, pending, completed, personnel count), Master Queue with override/reassignment controls, User Management (role switching), and IAS audit logs. |

*VitaCall includes a unified login page with **1-Click Quick Demo Switching** in the top navbar and login page for instant presentation and evaluation.*

---

## 🗄️ Firestore Database Schema

### 1. `users/` Collection
```typescript
interface UserProfile {
  uid: string;
  email: string;
  role: 'student' | 'medical_personnel' | 'admin';
  fullName: string;
  contactNumber: string;
  boardingAddress?: string; // Room and dormitory for boarding students
  studentIdNumber?: string;
  staffLicenseNumber?: string;
  createdAt: string;
  status: 'active' | 'suspended';
}
```

### 2. `requests/` Collection
```typescript
interface HealthRequest {
  id: string; // e.g. "REQ-2026-001"
  studentId: string;
  studentName: string;
  studentContact?: string;
  symptoms: string;
  symptomTags?: string[];
  severity?: 'Mild' | 'Moderate' | 'Severe / Urgent';
  boardingAddress: string;
  preferredSchedule: string;
  status: 'Pending' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';
  assignedPersonnelId?: string;
  assignedPersonnelName?: string;
  assignedPersonnelContact?: string;
  assignedAt?: string;
  vitals?: {
    temperature?: string;
    bloodPressure?: string;
    pulseRate?: string;
    oxygenSat?: string;
  };
  diagnosis?: string;
  medicalNotes?: string;
  treatment?: string;
  restDaysRecommended?: number;
  certificateId?: string; // e.g. "VITA-MED-2026-9812"
  certificateIssuedAt?: string;
  certificateHash?: string;
  attendingPhysician?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 3. `audit_logs/` Collection
```typescript
interface AuditLog {
  id: string;
  action: 'REQUEST_SUBMITTED' | 'REQUEST_ASSIGNED' | 'RESULTS_RECORDED' | 'CERTIFICATE_GENERATED' | 'ADMIN_OVERRIDE' | 'ROLE_UPDATED';
  performedBy: string;
  performedByEmail: string;
  userRole: string;
  targetId?: string;
  details: string;
  timestamp: string;
  integrityHash?: string;
}
```

---

## 🔧 Step-by-Step Firebase Configuration Guide

VitaCall is designed to work **out-of-the-box** with rich interactive seed data in **Demo Mode**, while also supporting immediate connection to your live Firebase project!

### Step 1: Create a Project in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/) and click **"Add project"**.
2. Name your project (e.g., `vitacall-health-app`).

### Step 2: Enable Firebase Authentication
1. In the left navigation, go to **Build ➔ Authentication**.
2. Click **Get Started**, choose the **Sign-in method** tab, and enable **Email/Password**.

### Step 3: Create Cloud Firestore Database
1. In the left navigation, go to **Build ➔ Firestore Database**.
2. Click **Create Database**, select your location, and start in **Test mode** (or apply production security rules).

### Step 4: Register a Web App & Copy Configuration
1. Go to **Project Settings** (gear icon) ➔ **General** ➔ scroll down to **Your apps**.
2. Click the Web icon `</>` to register a web app.
3. Copy the `firebaseConfig` object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "vitacall-xxx.firebaseapp.com",
     projectId: "vitacall-xxx",
     storageBucket: "vitacall-xxx.appspot.com",
     messagingSenderId: "123456789...",
     appId: "1:123456789:web:abcdef..."
   };
   ```

### Step 5: Configure in VitaCall (Two Easy Methods)
- **Method A (Interactive via App UI)**: Click the **Firebase Status Pill** in the top navbar (`Firebase Live` / `Demo Mode`), paste your keys into the dialog, and click **"Save & Connect Firebase"**!
- **Method B (Code Configuration)**: Open `src/environments/environment.ts` and paste your keys:
  ```typescript
  export const environment = {
    production: false,
    firebase: {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_PROJECT_ID.appspot.com",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID"
    },
    demoMode: false,
    // ...
  };
  ```

---

## 🏃‍♂️ How to Run Locally

```bash
# 1. Navigate to the project directory
cd vitacall

# 2. Install dependencies (if not already installed)
npm install

# 3. Start Angular Development Server
npm start
# or: npx ng serve --port 4200

# 4. Open browser at
http://localhost:4200/
```

---

## 📱 Mobile-First Features & UX Highlights
1. **Ergonomic Bottom Navigation Bar**: Automatically appears on mobile viewport for single-handed smartphone thumb usage.
2. **Desktop Mobile Viewport Simulation**: A floating button `📱 Toggle Mobile View` on desktop allows presenters to toggle a smartphone handset mockup frame to demonstrate the mobile experience live.
3. **Live Pipeline Progress Bar**: Animated multi-step progress indicator for students tracking their boarding checkup status.
4. **Tamper-Resistant Certificate Generator**: Full institutional letterhead, physician signature seal, QR code, and public verification portal at `/verify/:certificateId`.
