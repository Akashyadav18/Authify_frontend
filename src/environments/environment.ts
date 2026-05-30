// ── Development Environment ──────────────────────────────────────────
// This file is used during `ng serve` (development mode).
// For production builds (`ng build`), this is replaced by environment.prod.ts
// via the fileReplacements setting in angular.json.

export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api/auth',
  studentApi: 'http://localhost:8080/api',
  teacherApi: 'http://localhost:8080/api',
};
