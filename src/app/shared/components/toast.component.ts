import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ToastMessage } from '../../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto transform transition-all duration-300 ease-out translate-y-0 opacity-100 flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md"
          [ngClass]="getToastClasses(toast.type)"
        >
          <!-- Icon -->
          <div class="shrink-0 mt-0.5">
            @switch (toast.type) {
              @case ('success') {
                <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
                  ✓
                </div>
              }
              @case ('error') {
                <div class="w-6 h-6 rounded-full bg-rose-500/20 text-rose-600 flex items-center justify-center font-bold">
                  ✕
                </div>
              }
              @case ('warning') {
                <div class="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
                  !
                </div>
              }
              @default {
                <div class="w-6 h-6 rounded-full bg-teal-500/20 text-teal-600 flex items-center justify-center font-bold">
                  ℹ
                </div>
              }
            }
          </div>

          <!-- Body -->
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold text-slate-900 leading-tight">{{ toast.title }}</h4>
            <p class="text-xs text-slate-600 mt-0.5 leading-relaxed">{{ toast.message }}</p>
          </div>

          <!-- Dismiss button -->
          <button
            type="button"
            (click)="notificationService.dismiss(toast.id)"
            class="shrink-0 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  readonly notificationService = inject(NotificationService);

  getToastClasses(type: ToastMessage['type']): string {
    switch (type) {
      case 'success':
        return 'bg-emerald-50/95 border-emerald-200 text-emerald-950 shadow-emerald-500/10';
      case 'error':
        return 'bg-rose-50/95 border-rose-200 text-rose-950 shadow-rose-500/10';
      case 'warning':
        return 'bg-amber-50/95 border-amber-200 text-amber-950 shadow-amber-500/10';
      default:
        return 'bg-teal-50/95 border-teal-200 text-teal-950 shadow-teal-500/10';
    }
  }
}
