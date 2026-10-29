import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { UserProfile, UserRole, DemoAccount } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { AuditLogService } from './audit-log.service';
import { NotificationService } from './notification.service';

// Firebase Modular SDK imports
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  Auth,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  Firestore
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<UserProfile | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();

  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly userRole = computed(() => this.currentUserSignal()?.role || null);

  private isFirebaseConfiguredSignal = signal<boolean>(false);
  readonly isFirebaseConfigured = this.isFirebaseConfiguredSignal.asReadonly();

  private isDemoModeSignal = signal<boolean>(true);
  readonly isDemoMode = this.isDemoModeSignal.asReadonly();

  // Firebase instances
  private firebaseApp: FirebaseApp | null = null;
  private firebaseAuth: Auth | null = null;
  private firestore: Firestore | null = null;

  private readonly USER_STORAGE_KEY = 'vitacall_auth_user';
  private readonly USERS_DB_KEY = 'vitacall_users_db';
  private readonly FIREBASE_CONFIG_KEY = 'vitacall_firebase_config';

  readonly demoAccounts: DemoAccount[] = [
    // Students
    {
      id: 'UID-DEMO-STUDENT-001',
      email: 'student@campus.edu',
      password: 'student123',
      role: 'student',
      fullName: 'Angelica Ramos',
      contactNumber: '0917-889-4321',
      boardingAddress: 'Room 304, Sunshine Dormitory, University Belt',
      studentIdNumber: '2023-01452-MN-0',
      title: 'Boarding Student',
      description: 'Sunshine Dormitory • Has completed checkup & official certificate',
      avatarIcon: '👩‍🎓',
      badge: 'Dorm 304'
    },
    {
      id: 'UID-DEMO-STUDENT-002',
      email: 'student2@campus.edu',
      password: 'student123',
      role: 'student',
      fullName: 'Miguel Castillo',
      contactNumber: '0919-332-1144',
      boardingAddress: 'Unit B, Emerald Heights Boarding, Sta. Mesa',
      studentIdNumber: '2023-08912-MN-0',
      title: 'Boarding Student',
      description: 'Emerald Heights • Has an in-progress dispatch request',
      avatarIcon: '👨‍🎓',
      badge: 'Unit B'
    },
    {
      id: 'UID-DEMO-STUDENT-003',
      email: 'student3@campus.edu',
      password: 'student123',
      role: 'student',
      fullName: 'Charles Tan',
      contactNumber: '0928-119-9022',
      boardingAddress: 'Pad 12, Maple Leaf Residences, Sampaloc',
      studentIdNumber: '2022-04412-MN-0',
      title: 'Boarding Student',
      description: 'Maple Leaf Residences • Assigned case awaiting responder visit',
      avatarIcon: '🧑‍🎓',
      badge: 'Pad 12'
    },
    {
      id: 'UID-DEMO-STUDENT-004',
      email: 'student4@campus.edu',
      password: 'student123',
      role: 'student',
      fullName: 'Bea Santos',
      contactNumber: '0926-441-8899',
      boardingAddress: 'Room 108, Villa Feliza Boarding House, Sampaloc',
      studentIdNumber: '2023-09415-MN-0',
      title: 'Boarding Student',
      description: 'Villa Feliza • Active student profile ready for checkup requests',
      avatarIcon: '👩‍💼',
      badge: 'Room 108'
    },

    // Medical Personnel
    {
      id: 'UID-DEMO-PERSONNEL-001',
      email: 'personnel@campus.edu',
      password: 'personnel123',
      role: 'medical_personnel',
      fullName: 'Roberto Diaz, RN',
      contactNumber: '0920-554-1188',
      staffLicenseNumber: 'PRC-RN-0891244',
      title: 'Lead Dispatch Nurse',
      description: 'Campus Health Mobile Responder • Handles acute dorm visits & triage',
      avatarIcon: '👨‍⚕️',
      badge: 'PRC-RN-0891244'
    },
    {
      id: 'UID-DEMO-PERSONNEL-002',
      email: 'personnel2@campus.edu',
      password: 'nurse123',
      role: 'medical_personnel',
      fullName: 'Sarah Mendoza, RN',
      contactNumber: '0915-777-3322',
      staffLicenseNumber: 'PRC-RN-0772183',
      title: 'Emergency Response Nurse',
      description: 'Mobile First Responder • Assigned to Dormitory cluster B',
      avatarIcon: '👩‍⚕️',
      badge: 'PRC-RN-0772183'
    },
    {
      id: 'UID-DEMO-PERSONNEL-003',
      email: 'personnel3@campus.edu',
      password: 'doctor123',
      role: 'medical_personnel',
      fullName: 'Dr. Manuel Ramirez, MD',
      contactNumber: '0917-334-8822',
      staffLicenseNumber: 'PRC-MD-0523190',
      title: 'University Clinic Physician',
      description: 'Attending Physician • Clinical assessments & medical certificates',
      avatarIcon: '🩺',
      badge: 'PRC-MD-0523190'
    },

    // Administrators
    {
      id: 'UID-DEMO-ADMIN-001',
      email: 'admin@campus.edu',
      password: 'admin123',
      role: 'admin',
      fullName: 'Dr. Franz Go. MD',
      contactNumber: '0918-223-9900',
      staffLicenseNumber: 'PRC-MD-0419201',
      title: 'Health Services Director',
      description: 'Chief Medical Officer • Clinic operations, certifications & queue oversight',
      avatarIcon: '👨‍⚕️',
      badge: 'Chief Admin'
    },
    {
      id: 'UID-DEMO-ADMIN-002',
      email: 'admin2@campus.edu',
      password: 'admin123',
      role: 'admin',
      fullName: 'Engr. Mark Dela Cruz',
      contactNumber: '0916-882-7711',
      staffLicenseNumber: 'PRC-PECE-018244',
      title: 'System & IAS Administrator',
      description: 'System Security Officer • User access control and audit trail oversight',
      avatarIcon: '👨‍💻',
      badge: 'SysAdmin'
    }
  ];

  constructor(
    private router: Router,
    private auditLogService: AuditLogService,
    private notificationService: NotificationService
  ) {
    this.initFirebase();
    this.restoreSession();
  }

  /**
   * Initializes Firebase using either environment config or user-supplied config.
   */
  private initFirebase() {
    let config = environment.firebase;

    // Check if custom config was stored in localStorage
    const savedConfig = localStorage.getItem(this.FIREBASE_CONFIG_KEY);
    if (savedConfig) {
      try {
        config = JSON.parse(savedConfig);
      } catch (e) {
        console.error('Failed to parse saved Firebase config', e);
      }
    }

    if (config && config.apiKey && config.apiKey.trim().length > 10) {
      try {
        if (!getApps().length) {
          this.firebaseApp = initializeApp(config);
        } else {
          this.firebaseApp = getApps()[0];
        }
        this.firebaseAuth = getAuth(this.firebaseApp);
        this.firestore = getFirestore(this.firebaseApp);
        this.isFirebaseConfiguredSignal.set(true);
        this.isDemoModeSignal.set(false);

        // Listen to live Firebase Auth state changes
        onAuthStateChanged(this.firebaseAuth, async (fbUser: FirebaseUser | null) => {
          if (fbUser) {
            await this.fetchUserProfileFromFirestore(fbUser.uid, fbUser.email || '');
          }
        });
        console.log('Firebase initialized successfully with live config.');
      } catch (err) {
        console.warn('Firebase init error; falling back to reactive demo mode:', err);
        this.isFirebaseConfiguredSignal.set(false);
        this.isDemoModeSignal.set(true);
      }
    } else {
      // Demo mode
      this.isFirebaseConfiguredSignal.set(false);
      this.isDemoModeSignal.set(true);
    }
  }

  /**
   * Restores user session from storage or default initial state
   */
  private restoreSession() {
    const saved = localStorage.getItem(this.USER_STORAGE_KEY);
    if (saved) {
      try {
        const user = JSON.parse(saved) as UserProfile;
        if (user.fullName.includes('Posadas') || user.email === 'admin@campus.edu') {
          user.fullName = 'Dr. Franz Go. MD';
          user.avatarIcon = '👨‍⚕️';
          localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
        }
        this.currentUserSignal.set(user);
        return;
      } catch {
        localStorage.removeItem(this.USER_STORAGE_KEY);
      }
    }
    // Note: Do not auto-login as student when no session is present so user can pick their account on the login dashboard.
  }

  /**
   * Fetches user profile from Firestore `users` collection mapping uid to role and details.
   */
  private async fetchUserProfileFromFirestore(uid: string, email: string): Promise<UserProfile | null> {
    if (!this.firestore) return null;
    try {
      const userRef = doc(this.firestore, 'users', uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const profile: UserProfile = {
          uid,
          email,
          role: data['role'] || 'student',
          fullName: data['fullName'] || 'Campus User',
          contactNumber: data['contactNumber'] || '',
          boardingAddress: data['boardingAddress'] || '',
          studentIdNumber: data['studentIdNumber'] || '',
          staffLicenseNumber: data['staffLicenseNumber'] || '',
          avatarIcon: data['avatarIcon'] || '',
          badge: data['badge'] || '',
          createdAt: data['createdAt'] || new Date().toISOString(),
          status: data['status'] || 'active'
        };
        this.setUserSession(profile);
        return profile;
      }
    } catch (err) {
      console.error('Error fetching user document from Firestore:', err);
    }
    return null;
  }

  /**
   * Unified Login method: Authenticates with Firebase Auth or fallback DB
   */
  async login(email: string, password: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();

    // Map any common or previous email aliases for smooth backwards compatibility
    const emailAliases: Record<string, string> = {
      'admin1@campus.edu': 'admin@campus.edu',
      'admin.officer@campus.edu': 'admin2@campus.edu',
      'sysadmin@campus.edu': 'admin2@campus.edu',
      'personnel1@campus.edu': 'personnel@campus.edu',
      'nurse.sarah@campus.edu': 'personnel2@campus.edu',
      'nurse@campus.edu': 'personnel2@campus.edu',
      'doc.ramirez@campus.edu': 'personnel3@campus.edu',
      'doctor@campus.edu': 'personnel3@campus.edu',
      'student1@campus.edu': 'student@campus.edu',
      'miguel.castillo@campus.edu': 'student2@campus.edu',
      'charles.tan@campus.edu': 'student3@campus.edu',
      'bea.santos@campus.edu': 'student4@campus.edu'
    };
    const resolvedEmail = emailAliases[cleanEmail] || cleanEmail;

    // 1. If Firebase is active, sign in with Firebase Auth
    if (this.firebaseAuth && this.firestore && this.isFirebaseConfigured()) {
      try {
        const userCred = await signInWithEmailAndPassword(this.firebaseAuth, cleanEmail, password);
        const profile = await this.fetchUserProfileFromFirestore(userCred.user.uid, cleanEmail);
        if (profile) {
          this.auditLogService.log('USER_LOGIN', profile.fullName, profile.email, profile.role, 'User logged in via Firebase Auth', profile.uid);
          this.notificationService.success('Welcome back!', `Signed in as ${profile.fullName} (${this.getRoleLabel(profile.role)})`);
          this.redirectBasedOnRole(profile.role);
          return profile;
        }
      } catch (fbError: any) {
        console.error('Firebase Auth sign-in error:', fbError);
        throw new Error(fbError.message || 'Firebase authentication failed');
      }
    }

    // 2. Demo / Fallback Database
    const users = this.getAllStoredUsers();
    let found = users.find(u => u.email.toLowerCase() === cleanEmail || u.email.toLowerCase() === resolvedEmail);

    // Also check demo accounts registry
    const demoMatch = this.demoAccounts.find(d => d.email.toLowerCase() === cleanEmail || d.email.toLowerCase() === resolvedEmail);

    if (!found && demoMatch) {
      found = {
        uid: demoMatch.id,
        email: demoMatch.email,
        role: demoMatch.role,
        fullName: demoMatch.fullName,
        contactNumber: demoMatch.contactNumber,
        boardingAddress: demoMatch.boardingAddress || '',
        studentIdNumber: demoMatch.studentIdNumber || '',
        staffLicenseNumber: demoMatch.staffLicenseNumber || '',
        avatarIcon: demoMatch.avatarIcon,
        badge: demoMatch.badge,
        password: demoMatch.password,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      this.saveUserToLocalDb(found);
    }

    if (!found) {
      throw new Error(`Account not found for "${cleanEmail}". Please check your email or select one of the available accounts on the login screen.`);
    }

    // Verify password if specified in demo account or user profile
    const expectedPassword = found.password || demoMatch?.password;
    if (expectedPassword && password && password.trim() !== expectedPassword.trim()) {
      throw new Error(`Incorrect password for ${found.fullName}. (Hint: Expected password is "${expectedPassword}")`);
    }

    this.setUserSession(found);
    this.auditLogService.log('USER_LOGIN', found.fullName, found.email, found.role, 'User logged in to VitaCall system', found.uid);
    this.notificationService.success('Welcome back!', `Logged in as ${found.fullName} (${this.getRoleLabel(found.role)})`);
    this.redirectBasedOnRole(found.role);
    return found;
  }

  /**
   * Unified Register method: Creates user in Firebase Auth and writes to `users` collection.
   */
  async register(
    email: string,
    password: string,
    role: UserRole,
    fullName: string,
    contactNumber: string,
    boardingAddress?: string
  ): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Firebase Auth Registration
    if (this.firebaseAuth && this.firestore && this.isFirebaseConfigured()) {
      try {
        const userCred = await createUserWithEmailAndPassword(this.firebaseAuth, cleanEmail, password);
        const uid = userCred.user.uid;

        const newProfile: UserProfile = {
          uid,
          email: cleanEmail,
          role,
          fullName,
          contactNumber,
          boardingAddress: boardingAddress || '',
          createdAt: new Date().toISOString(),
          status: 'active'
        };

        // Write user profile to Firestore `users` collection mapping uid to role
        const userRef = doc(this.firestore, 'users', uid);
        await setDoc(userRef, newProfile);

        this.setUserSession(newProfile);
        this.auditLogService.log('USER_REGISTER', fullName, cleanEmail, role, `New account registered with role: ${role}`, uid);
        this.notificationService.success('Registration Complete', `Account created successfully as ${role}`);
        this.redirectBasedOnRole(role);
        return newProfile;
      } catch (fbError: any) {
        console.error('Firebase registration error:', fbError);
        throw new Error(fbError.message || 'Firebase user registration failed');
      }
    }

    // 2. Demo / Fallback Registration
    const users = this.getAllStoredUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const newProfile: UserProfile = {
      uid: `UID-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      email: cleanEmail,
      role,
      fullName,
      contactNumber,
      boardingAddress: boardingAddress || '',
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    this.saveUserToLocalDb(newProfile);
    this.setUserSession(newProfile);
    this.auditLogService.log('USER_REGISTER', fullName, cleanEmail, role, `New account registered with role: ${role}`, newProfile.uid);
    this.notificationService.success('Registration Complete', `Welcome to VitaCall, ${fullName}!`);
    this.redirectBasedOnRole(role);
    return newProfile;
  }

  /**
   * Logs in directly using a specific DemoAccount profile
   */
  loginWithAccount(account: DemoAccount, shouldRedirect = true): UserProfile {
    const user: UserProfile = {
      uid: account.id,
      email: account.email,
      role: account.role,
      fullName: account.fullName,
      contactNumber: account.contactNumber,
      boardingAddress: account.boardingAddress || (account.role === 'student' ? 'Sunshine Dormitory, University Belt' : ''),
      studentIdNumber: account.studentIdNumber || '',
      staffLicenseNumber: account.staffLicenseNumber || '',
      avatarIcon: account.avatarIcon,
      badge: account.badge,
      password: account.password,
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      status: 'active'
    };

    this.setUserSession(user);
    this.saveUserToLocalDb(user);

    if (shouldRedirect) {
      this.auditLogService.log('USER_LOGIN', user.fullName, user.email, user.role, `Switched account to ${user.fullName} (${user.role})`, user.uid);
      this.notificationService.success('Welcome back!', `Signed in as ${user.fullName} (${this.getRoleLabel(user.role)})`);
      this.redirectBasedOnRole(user.role);
    }

    return user;
  }

  /**
   * One-click demo login for rapid testing & evaluation
   */
  loginWithDemoAccount(role: UserRole, shouldRedirect = true) {
    const demo = this.demoAccounts.find(d => d.role === role);
    if (!demo) return;
    this.loginWithAccount(demo, shouldRedirect);
  }

  /**
   * Saves updated profile fields
   */
  updateProfile(updates: Partial<UserProfile>) {
    const current = this.currentUserSignal();
    if (!current) return;

    const updated = { ...current, ...updates };
    this.setUserSession(updated);
    this.saveUserToLocalDb(updated);

    if (this.firestore && this.isFirebaseConfigured()) {
      const userRef = doc(this.firestore, 'users', current.uid);
      setDoc(userRef, updated, { merge: true }).catch(console.error);
    }

    this.notificationService.success('Profile Updated', 'Your profile details have been saved.');
  }

  /**
   * Logs out the user and clears session
   */
  async logout() {
    const current = this.currentUserSignal();
    if (current) {
      this.auditLogService.log('USER_LOGIN', current.fullName, current.email, current.role, 'User signed out', current.uid);
    }

    if (this.firebaseAuth && this.isFirebaseConfigured()) {
      try {
        await signOut(this.firebaseAuth);
      } catch (e) {
        console.error('Firebase signout error:', e);
      }
    }

    this.currentUserSignal.set(null);
    localStorage.removeItem(this.USER_STORAGE_KEY);
    this.notificationService.info('Signed Out', 'You have been safely signed out of VitaCall.');
    this.router.navigate(['/login']);
  }

  /**
   * Automatically redirects user based on role to appropriate dashboard
   */
  redirectBasedOnRole(role: UserRole) {
    switch (role) {
      case 'student':
        this.router.navigate(['/student/dashboard']);
        break;
      case 'medical_personnel':
        this.router.navigate(['/personnel/dashboard']);
        break;
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  getRoleLabel(role: UserRole): string {
    switch (role) {
      case 'student': return 'Boarding Student';
      case 'medical_personnel': return 'Medical Personnel';
      case 'admin': return 'Health Administrator';
      default: return 'User';
    }
  }

  /**
   * Returns list of all known users (for Admin dashboard management)
   */
  getAllStoredUsers(): UserProfile[] {
    const seed: UserProfile[] = [
      // Students
      {
        uid: 'UID-DEMO-STUDENT-001',
        email: 'student@campus.edu',
        role: 'student',
        fullName: 'Angelica Ramos',
        contactNumber: '0917-889-4321',
        boardingAddress: 'Room 304, Sunshine Dormitory, University Belt',
        studentIdNumber: '2023-01452-MN-0',
        avatarIcon: '👩‍🎓',
        badge: 'Dorm 304',
        password: 'student123',
        createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
        status: 'active'
      },
      {
        uid: 'UID-DEMO-STUDENT-002',
        email: 'student2@campus.edu',
        role: 'student',
        fullName: 'Miguel Castillo',
        contactNumber: '0919-332-1144',
        boardingAddress: 'Unit B, Emerald Heights Boarding, Sta. Mesa',
        studentIdNumber: '2023-08912-MN-0',
        avatarIcon: '👨‍🎓',
        badge: 'Unit B',
        password: 'student123',
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        status: 'active'
      },
      {
        uid: 'UID-DEMO-STUDENT-003',
        email: 'student3@campus.edu',
        role: 'student',
        fullName: 'Charles Tan',
        contactNumber: '0928-119-9022',
        boardingAddress: 'Pad 12, Maple Leaf Residences, Sampaloc',
        studentIdNumber: '2022-04412-MN-0',
        avatarIcon: '🧑‍🎓',
        badge: 'Pad 12',
        password: 'student123',
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        status: 'active'
      },
      {
        uid: 'UID-DEMO-STUDENT-004',
        email: 'student4@campus.edu',
        role: 'student',
        fullName: 'Bea Santos',
        contactNumber: '0926-441-8899',
        boardingAddress: 'Room 108, Villa Feliza Boarding House, Sampaloc',
        studentIdNumber: '2023-09415-MN-0',
        avatarIcon: '👩‍💼',
        badge: 'Room 108',
        password: 'student123',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        status: 'active'
      },

      // Medical Personnel
      {
        uid: 'UID-DEMO-PERSONNEL-001',
        email: 'personnel@campus.edu',
        role: 'medical_personnel',
        fullName: 'Roberto Diaz, RN',
        contactNumber: '0920-554-1188',
        staffLicenseNumber: 'PRC-RN-0891244',
        avatarIcon: '👨‍⚕️',
        badge: 'PRC-RN-0891244',
        password: 'personnel123',
        createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
        status: 'active'
      },
      {
        uid: 'UID-DEMO-PERSONNEL-002',
        email: 'personnel2@campus.edu',
        role: 'medical_personnel',
        fullName: 'Sarah Mendoza, RN',
        contactNumber: '0915-777-3322',
        staffLicenseNumber: 'PRC-RN-0772183',
        avatarIcon: '👩‍⚕️',
        badge: 'PRC-RN-0772183',
        password: 'nurse123',
        createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
        status: 'active'
      },
      {
        uid: 'UID-DEMO-PERSONNEL-003',
        email: 'personnel3@campus.edu',
        role: 'medical_personnel',
        fullName: 'Dr. Manuel Ramirez, MD',
        contactNumber: '0917-334-8822',
        staffLicenseNumber: 'PRC-MD-0523190',
        avatarIcon: '🩺',
        badge: 'PRC-MD-0523190',
        password: 'doctor123',
        createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
        status: 'active'
      },

      // Administrators
      {
        uid: 'UID-DEMO-ADMIN-001',
        email: 'admin@campus.edu',
        role: 'admin',
        fullName: 'Dr. Franz Go. MD',
        contactNumber: '0918-223-9900',
        staffLicenseNumber: 'PRC-MD-0419201',
        avatarIcon: '👨‍⚕️',
        badge: 'Chief Admin',
        password: 'admin123',
        createdAt: new Date(Date.now() - 86400000 * 180).toISOString(),
        status: 'active'
      },
      {
        uid: 'UID-DEMO-ADMIN-002',
        email: 'admin2@campus.edu',
        role: 'admin',
        fullName: 'Engr. Mark Dela Cruz',
        contactNumber: '0916-882-7711',
        staffLicenseNumber: 'PRC-PECE-018244',
        avatarIcon: '👨‍💻',
        badge: 'SysAdmin',
        password: 'admin123',
        createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
        status: 'active'
      }
    ];

    try {
      const stored = localStorage.getItem(this.USERS_DB_KEY);
      if (stored) {
        let storedList = JSON.parse(stored) as UserProfile[];
        let updated = false;

        // Auto-migrate any old doctor name or old email mappings
        storedList = storedList.map(u => {
          if (u.fullName.includes('Posadas') || u.email === 'admin@campus.edu') {
            updated = true;
            return { ...u, email: 'admin@campus.edu', fullName: 'Dr. Franz Go. MD', avatarIcon: '👨‍⚕️' };
          }
          if (u.email === 'nurse.sarah@campus.edu') {
            updated = true;
            return { ...u, email: 'personnel2@campus.edu' };
          }
          if (u.email === 'doc.ramirez@campus.edu') {
            updated = true;
            return { ...u, email: 'personnel3@campus.edu' };
          }
          if (u.email === 'admin.officer@campus.edu') {
            updated = true;
            return { ...u, email: 'admin2@campus.edu' };
          }
          if (u.email === 'miguel.castillo@campus.edu') {
            updated = true;
            return { ...u, email: 'student2@campus.edu' };
          }
          if (u.email === 'charles.tan@campus.edu') {
            updated = true;
            return { ...u, email: 'student3@campus.edu' };
          }
          if (u.email === 'bea.santos@campus.edu') {
            updated = true;
            return { ...u, email: 'student4@campus.edu' };
          }
          return u;
        });

        // Merge missing seed accounts into stored list
        for (const s of seed) {
          if (!storedList.some(u => u.email.toLowerCase() === s.email.toLowerCase())) {
            storedList.push(s);
            updated = true;
          }
        }
        if (updated) {
          localStorage.setItem(this.USERS_DB_KEY, JSON.stringify(storedList));
        }
        return storedList;
      }
    } catch { }

    localStorage.setItem(this.USERS_DB_KEY, JSON.stringify(seed));
    return seed;
  }

  saveUserToLocalDb(user: UserProfile) {
    const list = this.getAllStoredUsers();
    const idx = list.findIndex(u => u.uid === user.uid || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...user };
    } else {
      list.push(user);
    }
    localStorage.setItem(this.USERS_DB_KEY, JSON.stringify(list));
  }

  /**
   * Admin operation to update a user's role or status
   */
  adminUpdateUser(uid: string, updates: Partial<UserProfile>): void {
    const list = this.getAllStoredUsers();
    const idx = list.findIndex(u => u.uid === uid);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updates };
      localStorage.setItem(this.USERS_DB_KEY, JSON.stringify(list));

      // Also update current user if same
      if (this.currentUserSignal()?.uid === uid) {
        this.currentUserSignal.set(list[idx]);
      }

      // If live Firestore, sync
      if (this.firestore && this.isFirebaseConfigured()) {
        const userRef = doc(this.firestore, 'users', uid);
        setDoc(userRef, updates, { merge: true }).catch(console.error);
      }

      this.auditLogService.log('ROLE_UPDATED', this.currentUserSignal()?.fullName || 'Admin', this.currentUserSignal()?.email || 'admin', 'admin', `Updated user ${list[idx].fullName} (${list[idx].email})`, uid);
      this.notificationService.success('User Updated', `Updated records for ${list[idx].fullName}`);
    }
  }

  /**
   * Save custom Firebase config provided by user via on-screen modal
   */
  saveCustomFirebaseConfig(config: any) {
    localStorage.setItem(this.FIREBASE_CONFIG_KEY, JSON.stringify(config));
    this.initFirebase();
    this.notificationService.success('Firebase Config Saved', 'Connected to custom Firebase project. Reloading session...');
  }

  private setUserSession(user: UserProfile) {
    this.currentUserSignal.set(user);
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
  }

  // Get raw Firestore instance for RequestService
  getFirestoreInstance(): Firestore | null {
    return this.firestore;
  }
}
