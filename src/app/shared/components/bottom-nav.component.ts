import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    @if (authService.isAuthenticated()) {
      <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-lg px-2 py-1 safe-area-pb">
        <div class="flex items-center justify-around max-w-md mx-auto">
          
          @switch (authService.userRole()) {
            @case ('student') {
              <a
                routerLink="/student/dashboard"
                routerLinkActive="text-teal-600 font-bold"
                [routerLinkActiveOptions]="{ exact: false }"
                class="flex flex-col items-center justify-center py-1.5 px-3 text-slate-500 hover:text-teal-600 transition-colors"
              >
                <span class="text-xl">📋</span>
                <span class="text-[10px] mt-0.5">My Requests</span>
              </a>

              <a
                routerLink="/verify"
                routerLinkActive="text-teal-600 font-bold"
                class="flex flex-col items-center justify-center py-1.5 px-3 text-slate-500 hover:text-teal-600 transition-colors"
              >
                <span class="text-xl">🔍</span>
                <span class="text-[10px] mt-0.5">Verify Cert</span>
              </a>
            }

            @case ('medical_personnel') {
              <a
                routerLink="/personnel/dashboard"
                routerLinkActive="text-teal-600 font-bold"
                class="flex flex-col items-center justify-center py-1.5 px-3 text-slate-500 hover:text-teal-600 transition-colors"
              >
                <span class="text-xl">🚑</span>
                <span class="text-[10px] mt-0.5">Queue</span>
              </a>

              <a
                routerLink="/verify"
                routerLinkActive="text-teal-600 font-bold"
                class="flex flex-col items-center justify-center py-1.5 px-3 text-slate-500 hover:text-teal-600 transition-colors"
              >
                <span class="text-xl">🔍</span>
                <span class="text-[10px] mt-0.5">Verify Cert</span>
              </a>
            }

            @case ('admin') {
              <a
                routerLink="/admin/dashboard"
                routerLinkActive="text-teal-600 font-bold"
                class="flex flex-col items-center justify-center py-1.5 px-3 text-slate-500 hover:text-teal-600 transition-colors"
              >
                <span class="text-xl">📊</span>
                <span class="text-[10px] mt-0.5">Admin Ops</span>
              </a>

              <a
                routerLink="/verify"
                routerLinkActive="text-teal-600 font-bold"
                class="flex flex-col items-center justify-center py-1.5 px-3 text-slate-500 hover:text-teal-600 transition-colors"
              >
                <span class="text-xl">🔍</span>
                <span class="text-[10px] mt-0.5">Verify Cert</span>
              </a>
            }
          }

        </div>
      </nav>
    }
  `
})
export class BottomNavComponent {
  readonly authService = inject(AuthService);
}
