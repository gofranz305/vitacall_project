import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestStatus } from '../../core/models/request.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border transition-all duration-200"
      [ngClass]="getBadgeClass()"
    >
      <span class="w-2 h-2 rounded-full" [ngClass]="getDotClass()"></span>
      {{ status }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input({ required: true }) status: RequestStatus = 'Pending';

  getBadgeClass(): string {
    switch (this.status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-800 border-amber-200/80 shadow-xs';
      case 'Assigned':
        return 'bg-sky-50 text-sky-800 border-sky-200/80 shadow-xs';
      case 'In Progress':
        return 'bg-purple-50 text-purple-800 border-purple-200/80 shadow-xs animate-pulse';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/80 shadow-xs';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-700 border-slate-300 shadow-xs';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  getDotClass(): string {
    switch (this.status) {
      case 'Pending': return 'bg-amber-500';
      case 'Assigned': return 'bg-sky-500';
      case 'In Progress': return 'bg-purple-500 animate-ping';
      case 'Completed': return 'bg-emerald-500';
      case 'Cancelled': return 'bg-slate-400';
      default: return 'bg-gray-400';
    }
  }
}
