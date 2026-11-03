// ── Development Environment ──────────────────────────────────────────
// This file is used during `ng serve` (development mode).
// For production builds (`ng build`), this is replaced by environment.prod.ts
// via the fileReplacements setting in angular.json.

export const environment = {
  production: false,
  apiBaseUrl: 'https://authify-v3.onrender.com/api/auth',
  adminApiUrl: 'https://authify-v3.onrender.com/api/admin',
  invitationUrl: 'https://authify-v3.onrender.com/api/auth/invitations',
  studentApi: 'https://authify-v3.onrender.com/api',
  teacherApi: 'https://authify-v3.onrender.com/api',
  staffApi: 'https://authify-v3.onrender.com/api/staff',
};
