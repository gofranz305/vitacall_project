import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-firebase-config-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
        <div class="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
          
          <!-- Header -->
          <div class="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shadow-inner border border-white/20">
                🔥
              </div>
              <div>
                <h3 class="font-bold text-lg leading-tight">Firebase Configuration</h3>
                <p class="text-xs text-amber-100 font-medium">Authentication & Cloud Firestore Integration</p>
              </div>
            </div>
            <button
              (click)="close.emit()"
              class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-colors"
            >
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
            <!-- Current Status -->
            <div class="p-3.5 rounded-xl border flex items-center justify-between"
              [ngClass]="authService.isFirebaseConfigured() ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'"
            >
              <div class="flex items-center gap-2.5">
                <span class="w-3 h-3 rounded-full" [ngClass]="authService.isFirebaseConfigured() ? 'bg-emerald-500' : 'bg-amber-500'"></span>
                <div>
                  <div class="font-bold text-sm">
                    {{ authService.isFirebaseConfigured() ? 'Connected to Live Firebase' : 'Interactive Demo Mode Active' }}
                  </div>
                  <div class="text-[11px] opacity-80">
                    {{ authService.isFirebaseConfigured() ? 'Auth & Firestore synced with your project' : 'Simulating live backend with realistic seed data' }}
                  </div>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                [ngClass]="authService.isFirebaseConfigured() ? 'bg-emerald-200/60 text-emerald-950' : 'bg-amber-200/60 text-amber-950'"
              >
                {{ authService.isFirebaseConfigured() ? 'Production Ready' : 'Demo Ready' }}
              </span>
            </div>

            <!-- Quick Instructions -->
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 class="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span>📋</span> Step-by-Step Firebase Setup Guide:
              </h4>
              <ol class="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
                <li>Create a project in the <strong>Firebase Console</strong> (firebase.google.com).</li>
                <li>Under <strong>Authentication</strong>, enable <em>Email/Password</em> provider.</li>
                <li>Under <strong>Cloud Firestore</strong>, create a database in test mode.</li>
                <li>In <em>Project Settings → General → Your Apps</em>, add a Web App to get your Firebase Config object.</li>
                <li>Paste the values below, or edit <code class="bg-slate-200 text-slate-800 px-1 py-0.5 rounded">src/environments/environment.ts</code>.</li>
              </ol>
            </div>

            <!-- Form fields -->
            <div class="space-y-3">
              <div>
                <label class="block font-semibold text-slate-800 mb-1">Firebase API Key</label>
                <input
                  type="text"
                  [(ngModel)]="config.apiKey"
                  placeholder="AIzaSy..."
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-800 mb-1">Auth Domain</label>
                  <input
                    type="text"
                    [(ngModel)]="config.authDomain"
                    placeholder="your-app.firebaseapp.com"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block font-semibold text-slate-800 mb-1">Project ID</label>
                  <input
                    type="text"
                    [(ngModel)]="config.projectId"
                    placeholder="your-app-id"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-800 mb-1">Storage Bucket</label>
                  <input
                    type="text"
                    [(ngModel)]="config.storageBucket"
                    placeholder="your-app.appspot.com"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block font-semibold text-slate-800 mb-1">App ID</label>
                  <input
                    type="text"
                    [(ngModel)]="config.appId"
                    placeholder="1:12345678:web:abcdef..."
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

          </div>

          <!-- Footer Actions -->
          <div class="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              (click)="resetToDemo()"
              class="text-xs text-slate-600 hover:text-slate-900 underline font-medium"
            >
              Reset to Offline Demo Mode
            </button>
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="close.emit()"
                class="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                (click)="saveConfig()"
                class="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-all"
              >
                Save & Connect Firebase
              </button>
            </div>
          </div>

        </div>
      </div>
    }
  `
})
export class FirebaseConfigModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  readonly authService = inject(AuthService);

  config = {
    apiKey: environment.firebase.apiKey || '',
    authDomain: environment.firebase.authDomain || '',
    projectId: environment.firebase.projectId || '',
    storageBucket: environment.firebase.storageBucket || '',
    messagingSenderId: environment.firebase.messagingSenderId || '',
    appId: environment.firebase.appId || ''
  };

  saveConfig() {
    this.authService.saveCustomFirebaseConfig(this.config);
    this.close.emit();
  }

  resetToDemo() {
    localStorage.removeItem('vitacall_firebase_config');
    window.location.reload();
  }
}
