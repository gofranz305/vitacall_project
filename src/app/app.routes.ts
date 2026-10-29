import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'student/dashboard',
    loadComponent: () => import('./features/student/student-dashboard.component').then(m => m.StudentDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['student'] }
  },
  {
    path: 'personnel/dashboard',
    loadComponent: () => import('./features/personnel/personnel-dashboard.component').then(m => m.PersonnelDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['medical_personnel'] }
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'verify',
    loadComponent: () => import('./features/verification/verify-certificate.component').then(m => m.VerifyCertificateComponent)
  },
  {
    path: 'verify/:certificateId',
    loadComponent: () => import('./features/verification/verify-certificate.component').then(m => m.VerifyCertificateComponent)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
