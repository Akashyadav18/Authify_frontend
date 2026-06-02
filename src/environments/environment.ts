// ── Development Environment ──────────────────────────────────────────
// This file is used during `ng serve` (development mode).
// For production builds (`ng build`), this is replaced by environment.prod.ts
// via the fileReplacements setting in angular.json.

export const environment = {
  production: false,
  apiBaseUrl: 'https://authify-deployment-frll.onrender.com/api/auth',
  studentApi: 'https://authify-deployment-frll.onrender.com/api',
  teacherApi: 'https://authify-deployment-frll.onrender.com/api',
};
