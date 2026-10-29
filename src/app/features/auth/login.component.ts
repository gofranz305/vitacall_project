import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { DemoAccount, UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-100">
      
      <!-- Top Brand Header -->
      <div class="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-teal-600/25 text-3xl mb-3">
          🩺
        </div>
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">VitaCall</h2>
        <p class="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto font-medium">
          Boarding Student Health Request & Monitoring System
        </p>
      </div>

      <!-- Main Login Container Card -->
      <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div class="bg-white py-6 px-5 sm:p-8 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200/80">
          
          <!-- Mode Tabs: Sign In / Create Account -->
          <div class="flex rounded-2xl bg-slate-100 p-1 mb-6 text-xs font-semibold">
            <button
              type="button"
              (click)="isRegisterMode.set(false)"
              class="flex-1 py-2.5 rounded-xl transition-all"
              [ngClass]="!isRegisterMode() ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
            >
              🔑 Choose Account / Sign In
            </button>
            <button
              type="button"
              (click)="isRegisterMode.set(true)"
              class="flex-1 py-2.5 rounded-xl transition-all"
              [ngClass]="isRegisterMode() ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
            >
              ✨ Register New Account
            </button>
          </div>

          @if (!isRegisterMode()) {
            <!-- Multi-User Account Selector Section -->
            <div class="mb-6">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span>👥</span> Select a User Account to Sign In:
                </span>
                <span class="text-[11px] text-teal-700 font-medium">
                  Separate accounts for each role
                </span>
              </div>

              <!-- Role Tabs: Students / Personnel / Admins -->
              <div class="grid grid-cols-3 gap-2 p-1 bg-slate-100/80 rounded-2xl mb-4 text-xs font-bold">
                <button
                  type="button"
                  (click)="setRoleTab('student')"
                  class="py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  [ngClass]="activeRoleTab() === 'student' ? 'bg-white text-teal-800 shadow-sm ring-1 ring-teal-200' : 'text-slate-600 hover:text-slate-900'"
                >
                  <span>🎓</span>
                  <span class="truncate">Students ({{ studentAccounts().length }})</span>
                </button>

                <button
                  type="button"
                  (click)="setRoleTab('medical_personnel')"
                  class="py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  [ngClass]="activeRoleTab() === 'medical_personnel' ? 'bg-white text-sky-800 shadow-sm ring-1 ring-sky-200' : 'text-slate-600 hover:text-slate-900'"
                >
                  <span>🩺</span>
                  <span class="truncate">Personnel ({{ personnelAccounts().length }})</span>
                </button>

                <button
                  type="button"
                  (click)="setRoleTab('admin')"
                  class="py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  [ngClass]="activeRoleTab() === 'admin' ? 'bg-white text-purple-800 shadow-sm ring-1 ring-purple-200' : 'text-slate-600 hover:text-slate-900'"
                >
                  <span>🛡️</span>
                  <span class="truncate">Admin ({{ adminAccounts().length }})</span>
                </button>
              </div>

              <!-- Account Cards Grid for Active Role -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                @for (acc of currentRoleAccounts(); track acc.id) {
                  <div
                    class="p-3.5 rounded-2xl border transition-all duration-200 text-left relative group hover:shadow-md"
                    [ngClass]="getAccountCardTheme(acc.role)"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex items-center gap-2.5">
                        <div class="w-10 h-10 rounded-xl bg-white/90 shadow-xs flex items-center justify-center text-xl shrink-0">
                          {{ acc.avatarIcon }}
                        </div>
                        <div>
                          <h4 class="font-bold text-slate-900 text-xs sm:text-sm leading-tight flex items-center gap-1.5">
                            <span>{{ acc.fullName }}</span>
                          </h4>
                          <span class="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                [ngClass]="getBadgeClass(acc.role)">
                            {{ acc.badge }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p class="text-[11px] text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {{ acc.description }}
                    </p>

                    <!-- Credentials hint & Quick sign-in -->
                    <div class="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <div class="font-mono text-slate-500 text-[10px] truncate max-w-[150px]" [title]="acc.email">
                        {{ acc.email }}
                      </div>
                      <div class="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          (click)="fillFormWithAccount(acc)"
                          title="Fill credentials into manual form"
                          class="px-2 py-1 rounded-lg bg-white/80 hover:bg-white text-slate-600 border border-slate-200 text-[10px] font-semibold transition-colors"
                        >
                          Fill Form
                        </button>
                        <button
                          type="button"
                          (click)="signInWithAccount(acc)"
                          class="px-2.5 py-1 rounded-lg text-white font-bold text-[10px] shadow-xs transition-transform transform active:scale-95 flex items-center gap-1"
                          [ngClass]="getButtonTheme(acc.role)"
                        >
                          <span>Sign In</span>
                          <span>➔</span>
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Manual Sign In Form Header Divider -->
              <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-slate-200"></div>
                </div>
                <div class="relative flex justify-center text-xs">
                  <span class="bg-white px-3 text-slate-500 font-semibold">
                    Or Sign In Manually with Email & Password
                  </span>
                </div>
              </div>

            </div>
          }

          <!-- Reactive Form: Sign In / Create Account -->
          <form [formGroup]="authForm" (ngSubmit)="onSubmit()" class="space-y-4">
            
            @if (isRegisterMode()) {
              <!-- Full Name -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  formControlName="fullName"
                  placeholder="e.g. Angelica Ramos"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                />
                @if (authForm.get('fullName')?.touched && authForm.get('fullName')?.invalid) {
                  <span class="text-[11px] text-rose-500 mt-1 block">Full name is required.</span>
                }
              </div>

              <!-- Role Selector -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Select Account Role:</label>
                <select
                  formControlName="role"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all font-medium"
                >
                  <option value="student">🎓 Boarding Student (Checkup Requester)</option>
                  <option value="medical_personnel">🩺 Medical Personnel (Campus Health Responder)</option>
                  <option value="admin">🛡️ System Administrator (Supervisor & IAS Oversight)</option>
                </select>
              </div>

              <!-- Contact Number -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Contact / Mobile Number</label>
                <input
                  type="tel"
                  formControlName="contactNumber"
                  placeholder="e.g. 0917-123-4567"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                />
              </div>

              <!-- Conditional Boarding Address (for students) -->
              @if (authForm.get('role')?.value === 'student') {
                <div class="animate-fade-in">
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    Boarding House Residence / Dormitory Address
                  </label>
                  <input
                    type="text"
                    formControlName="boardingAddress"
                    placeholder="e.g. Room 304, Sunshine Dormitory, University Belt"
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                  />
                  <p class="text-[10px] text-slate-400 mt-0.5">Used by campus medical staff for on-site dispatch checkups.</p>
                </div>
              }
            }

            <!-- Email Address -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                formControlName="email"
                placeholder="name@campus.edu"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
              />
              @if (authForm.get('email')?.touched && authForm.get('email')?.invalid) {
                <span class="text-[11px] text-rose-500 mt-1 block">A valid email address is required.</span>
              }
            </div>

            <!-- Password with Show/Hide Toggle -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-semibold text-slate-700">Password</label>
                @if (!isRegisterMode()) {
                  <span class="text-[10px] text-slate-400">
                    Default passwords: <strong>student123</strong> • <strong>personnel123</strong> • <strong>admin123</strong>
                  </span>
                }
              </div>
              <div class="relative">
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••••"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all pr-10"
                />
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                  title="Toggle password visibility"
                >
                  {{ showPassword() ? '🙈' : '👁️' }}
                </button>
              </div>
              @if (authForm.get('password')?.touched && authForm.get('password')?.invalid) {
                <span class="text-[11px] text-rose-500 mt-1 block">Password must be at least 6 characters.</span>
              }
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="loading() || authForm.invalid"
              class="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md shadow-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              @if (loading()) {
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Authenticating...</span>
              } @else {
                <span>{{ isRegisterMode() ? 'Create VitaCall Account' : 'Sign In to Dashboard' }}</span>
                <span>➔</span>
              }
            </button>
          </form>

          <!-- Security Footnote -->
          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span class="flex items-center gap-1">
              <span>🔒</span> Encrypted Auth & Role-Based Access Control
            </span>
            <span class="text-teal-700 font-semibold">VitaCall Campus Portal</span>
          </div>

        </div>
      </div>

    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  isRegisterMode = signal<boolean>(false);
  loading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  activeRoleTab = signal<UserRole>('student');

  // Filter accounts by role
  readonly studentAccounts = computed(() =>
    this.authService.demoAccounts.filter(a => a.role === 'student')
  );

  readonly personnelAccounts = computed(() =>
    this.authService.demoAccounts.filter(a => a.role === 'medical_personnel')
  );

  readonly adminAccounts = computed(() =>
    this.authService.demoAccounts.filter(a => a.role === 'admin')
  );

  readonly currentRoleAccounts = computed(() => {
    switch (this.activeRoleTab()) {
      case 'student': return this.studentAccounts();
      case 'medical_personnel': return this.personnelAccounts();
      case 'admin': return this.adminAccounts();
      default: return this.studentAccounts();
    }
  });

  setRoleTab(role: UserRole) {
    this.activeRoleTab.set(role);
    if (role === 'student') {
      this.authForm.patchValue({
        email: 'student@campus.edu',
        password: 'student123',
        role: 'student',
        fullName: 'Angelica Ramos',
        contactNumber: '0917-889-4321',
        boardingAddress: 'Room 304, Sunshine Dormitory, University Belt'
      });
    } else if (role === 'medical_personnel') {
      this.authForm.patchValue({
        email: 'personnel@campus.edu',
        password: 'personnel123',
        role: 'medical_personnel',
        fullName: 'Roberto Diaz, RN',
        contactNumber: '0920-554-1188',
        boardingAddress: ''
      });
    } else if (role === 'admin') {
      this.authForm.patchValue({
        email: 'admin@campus.edu',
        password: 'admin123',
        role: 'admin',
        fullName: 'Dr. Franz Go. MD',
        contactNumber: '0918-223-9900',
        boardingAddress: ''
      });
    }
  }

  authForm: FormGroup = this.fb.group({
    email: ['student@campus.edu', [Validators.required, Validators.email]],
    password: ['student123', [Validators.required, Validators.minLength(6)]],
    fullName: [''],
    role: ['student' as UserRole],
    contactNumber: ['0917-889-4321'],
    boardingAddress: ['Room 304, Sunshine Dormitory, University Belt']
  });

  signInWithAccount(account: DemoAccount) {
    this.authService.loginWithAccount(account, true);
  }

  fillFormWithAccount(account: DemoAccount) {
    this.authForm.patchValue({
      email: account.email,
      password: account.password,
      fullName: account.fullName,
      role: account.role,
      contactNumber: account.contactNumber,
      boardingAddress: account.boardingAddress || ''
    });
    this.notificationService.info('Credentials Filled', `Filled email and password for ${account.fullName}. Click 'Sign In to Dashboard' to continue.`);
  }

  async onSubmit() {
    if (this.authForm.invalid) return;

    this.loading.set(true);
    const val = this.authForm.value;

    try {
      if (this.isRegisterMode()) {
        await this.authService.register(
          val.email,
          val.password,
          val.role,
          val.fullName || val.email.split('@')[0],
          val.contactNumber || 'N/A',
          val.boardingAddress
        );
      } else {
        await this.authService.login(val.email, val.password);
      }
    } catch (err: any) {
      this.notificationService.error('Authentication Error', err.message || 'Unable to sign in. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  getAccountCardTheme(role: UserRole): string {
    switch (role) {
      case 'student':
        return 'bg-gradient-to-br from-teal-50/70 to-emerald-50/40 border-teal-200/80 hover:border-teal-400 hover:shadow-teal-100/50';
      case 'medical_personnel':
        return 'bg-gradient-to-br from-sky-50/70 to-blue-50/40 border-sky-200/80 hover:border-sky-400 hover:shadow-sky-100/50';
      case 'admin':
        return 'bg-gradient-to-br from-purple-50/70 to-indigo-50/40 border-purple-200/80 hover:border-purple-400 hover:shadow-purple-100/50';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  }

  getBadgeClass(role: UserRole): string {
    switch (role) {
      case 'student': return 'bg-teal-100 text-teal-800';
      case 'medical_personnel': return 'bg-sky-100 text-sky-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }

  getButtonTheme(role: UserRole): string {
    switch (role) {
      case 'student':
        return 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700';
      case 'medical_personnel':
        return 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700';
      case 'admin':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700';
      default:
        return 'bg-slate-800';
    }
  }
}
