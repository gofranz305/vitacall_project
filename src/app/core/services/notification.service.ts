import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastsSignal = signal<ToastMessage[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  show(type: 'success' | 'error' | 'info' | 'warning', title: string, message: string, duration = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, title, message, duration };
    
    this.toastsSignal.update(toasts => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  success(title: string, message: string, duration = 4000) {
    this.show('success', title, message, duration);
  }

  error(title: string, message: string, duration = 5000) {
    this.show('error', title, message, duration);
  }

  info(title: string, message: string, duration = 4000) {
    this.show('info', title, message, duration);
  }

  warning(title: string, message: string, duration = 4500) {
    this.show('warning', title, message, duration);
  }

  dismiss(id: string) {
    this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
  }
}
