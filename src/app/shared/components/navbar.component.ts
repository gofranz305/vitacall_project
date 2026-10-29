import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';
import { FirebaseConfigModalComponent } from './firebase-config-modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FirebaseConfigModalComponent],
  template: `
    <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          
          <!-- Logo & Brand -->
          <div class="flex items-center gap-3">
            <a routerLink="/" class="flex items-center gap-2.5 group">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <span class="text-xl">🩺</span>
              </div>
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="font-extrabold text-slate-900 tracking-tight text-lg group-hover:text-teal-600 transition-colors">VitaCall</span>
                  <span class="px-1.5 py-0.5 bg-teal-100 text-teal-800 rounded text-[10px] font-bold uppercase tracking-wider">Health</span>
                </div>
                <p class="text-[10px] text-slate-500 font-medium leading-none">Boarding Student Health Dispatch</p>
              </div>
            </a>

            <!-- Navigation Links (Desktop) -->
            @if (authService.isAuthenticated()) {
              <nav class="hidden md:flex items-center gap-1 ml-6 pl-6 border-l border-slate-200">
                @switch (authService.userRole()) {
                  @case ('student') {
                    <a
                      routerLink="/student/dashboard"
                      routerLinkActive="bg-teal-50 text-teal-800 font-semibold"
                      class="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      Student Portal
                    </a>
                  }
                  @case ('medical_personnel') {
                    <a
                      routerLink="/personnel/dashboard"
                      routerLinkActive="bg-teal-50 text-teal-800 font-semibold"
                      class="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      Medical Personnel Queue
                    </a>
                  }
                  @case ('admin') {
                    <a
                      routerLink="/admin/dashboard"
                      routerLinkActive="bg-teal-50 text-teal-800 font-semibold"
                      class="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      Admin Center
                    </a>
                  }
                }
                <a
                  routerLink="/verify"
                  routerLinkActive="bg-teal-50 text-teal-800 font-semibold"
                  class="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  Verify Certificate
                </a>
              </nav>
            }
          </div>

          <!-- Right side controls: Role badge, Quick Switcher, Firebase status, Profile -->
          <div class="flex items-center gap-2 sm:gap-3">
            
            <!-- Firebase Status Pill -->
            <button
              type="button"
              (click)="isFirebaseModalOpen.set(true)"
              class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer"
              [ngClass]="authService.isFirebaseConfigured() ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'"
              title="Click to manage Firebase keys and database connection"
            >
              <span class="w-2 h-2 rounded-full" [ngClass]="authService.isFirebaseConfigured() ? 'bg-emerald-500' : 'bg-amber-500'"></span>
              <span>{{ authService.isFirebaseConfigured() ? 'Firebase Live' : 'Demo Mode' }}</span>
              <span class="text-[10px] opacity-70">⚙</span>
            </button>

            <!-- User Controls when Authenticated -->
            @if (authService.isAuthenticated()) {
              <!-- Quick Demo Role Switcher Dropdown -->
              <div class="relative">
                <button
                  type="button"
                  (click)="isRoleMenuOpen.set(!isRoleMenuOpen())"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 transition-colors"
                >
                  <span class="text-xs">🔄 Switch Role:</span>
                  <span class="capitalize text-teal-700 font-bold hidden xs:inline">{{ authService.currentUser()?.role?.replace('_', ' ') }}</span>
                  <span class="text-[10px] text-slate-500">▼</span>
                </button>

                @if (isRoleMenuOpen()) {
                  <div class="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fade-in">
                    <div class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 flex items-center justify-between">
                      <span>Quick Role Switch</span>
                      <a routerLink="/login" (click)="isRoleMenuOpen.set(false)" class="text-teal-600 hover:underline">All Accounts ➔</a>
                    </div>
                    
                    <button
                      type="button"
                      (click)="switchRole('student')"
                      class="w-full text-left p-2.5 rounded-xl hover:bg-teal-50 transition-colors flex items-start gap-2.5"
                      [ngClass]="{'bg-teal-50/80 border border-teal-200/60': authService.userRole() === 'student'}"
                    >
                      <span class="text-base mt-0.5">🎓</span>
                      <div>
                        <div class="font-bold text-xs text-slate-900">Student Account</div>
                        <div class="text-[11px] text-slate-500">Request checkups & get certificates</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      (click)="switchRole('medical_personnel')"
                      class="w-full text-left p-2.5 rounded-xl hover:bg-sky-50 transition-colors flex items-start gap-2.5 mt-1"
                      [ngClass]="{'bg-sky-50/80 border border-sky-200/60': authService.userRole() === 'medical_personnel'}"
                    >
                      <span class="text-base mt-0.5">🩺</span>
                      <div>
                        <div class="font-bold text-xs text-slate-900">Medical Personnel</div>
                        <div class="text-[11px] text-slate-500">Accept requests & record diagnosis</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      (click)="switchRole('admin')"
                      class="w-full text-left p-2.5 rounded-xl hover:bg-purple-50 transition-colors flex items-start gap-2.5 mt-1"
                      [ngClass]="{'bg-purple-50/80 border border-purple-200/60': authService.userRole() === 'admin'}"
                    >
                      <span class="text-base mt-0.5">🛡️</span>
                      <div>
                        <div class="font-bold text-xs text-slate-900">Administrator</div>
                        <div class="text-[11px] text-slate-500">Manage queues, users & audit logs</div>
                      </div>
                    </button>
                  </div>
                }
              </div>

              <!-- User Info / Sign Out -->
              <div class="flex items-center gap-2 pl-2">
                <div class="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs" [title]="authService.currentUser()?.fullName || 'User'">
                  {{ authService.currentUser()?.avatarIcon || authService.currentUser()?.fullName?.charAt(0) || 'U' }}
                </div>
                <button
                  type="button"
                  (click)="logout()"
                  title="Sign Out"
                  class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <span class="text-sm">🚪</span>
                </button>
              </div>
            } @else {
              <a
                routerLink="/login"
                class="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>🔑</span>
                <span>Sign In</span>
              </a>
            }

          </div>

        </div>
      </div>
    </header>

    <!-- Firebase Modal -->
    <app-firebase-config-modal
      [isOpen]="isFirebaseModalOpen()"
      (close)="isFirebaseModalOpen.set(false)"
    />
  `
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  private router = inject(Router);

  isRoleMenuOpen = signal<boolean>(false);
  isFirebaseModalOpen = signal<boolean>(false);

  switchRole(role: UserRole) {
    this.isRoleMenuOpen.set(false);
    this.authService.loginWithDemoAccount(role, true);
  }

  logout() {
    this.authService.logout();
  }
}
