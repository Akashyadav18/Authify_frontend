import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./pages/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./pages/verify-email/verify-email.component').then(
        (m) => m.VerifyEmailComponent,
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },

  // ── Student Routes (auth required) ──────────────────────────────────
  {
    path: 'student',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/student/student').then((m) => m.Student),
  },
  {
    path: 'students/create',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/student/student-form/student-form.component').then(
        (m) => m.StudentFormComponent,
      ),
  },
  {
    path: 'students/edit/:stdId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/student/student-form/student-form.component').then(
        (m) => m.StudentFormComponent,
      ),
  },

  // ── Teacher Routes (auth required) ──────────────────────────────────
  {
    path: 'teacher',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/teacher/teacher').then((m) => m.Teacher),
  },
  {
    path: 'teachers/create',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/teacher/teacher-form/teacher-form.component').then(
        (m) => m.TeacherFormComponent,
      ),
  },
  {
    path: 'teachers/edit/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/teacher/teacher-form/teacher-form.component').then(
        (m) => m.TeacherFormComponent,
      ),
  },

  { path: '**', redirectTo: '' },
];

