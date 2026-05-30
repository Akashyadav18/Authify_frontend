# Active Context

> ⚠️ UPDATE THIS FILE at the end of every AI session.

## Current Phase
Frontend — CRUD Features Complete (Student + Teacher full CRUD)

## Completed This Session
1. ✅ `teacher.model.ts` — TeacherReq / TeacherRes interfaces
2. ✅ `student.service.ts` — Completed with all 5 CRUD methods (was only getAllStudents)
3. ✅ `teacher.service.ts` — New service with all 5 CRUD methods (in `src/app/services/`)
4. ✅ `environment.ts` + `environment.prod.ts` — Added `teacherApi` field
5. ✅ `auth.interceptor.ts` — Added 403 handling (toast only, no redirect)
6. ✅ `ConfirmDialogComponent` — Reusable animated modal (`shared/components/confirm-dialog/`)
7. ✅ `student.ts` — Wired Create/Edit/Delete + confirm dialog + loading state
8. ✅ `student.html` — Create button + confirm dialog tag + loading state
9. ✅ `student.css` — Added btn-create + loading/spinner styles
10. ✅ `StudentFormComponent` — Create/edit mode via route param, inline field errors
11. ✅ `teacher.ts` — Replaced ALL mock data with real API + CRUD actions
12. ✅ `teacher.html` — Rewritten as cards grid (matches student style, purple accent)
13. ✅ `teacher.css` — Full rewrite matching student cards design
14. ✅ `TeacherFormComponent` — Create/edit mode, 6 fields, inline errors
15. ✅ `app.routes.ts` — 4 new lazy-loaded routes added

## Key Decisions Made
- **No role-based button hiding** — all buttons visible to everyone; backend returns 403 → shown as toast
- **student.service.ts stays in `src/app/services/`** (not moved to core/services/)
- **teacher.service.ts created in `src/app/services/`** (same level as student.service.ts)
- **Permission rule**: ADMIN + TEACHER can delete students (corrected from AI_CONTEXT_PASTE.md)
- **Teacher avatar** uses purple theme instead of blue to distinguish from student section

## Route Map (Updated)
| Route                   | Component               |
|-------------------------|-------------------------|
| /student                | Student (list)          |
| /students/create        | StudentFormComponent    |
| /students/edit/:stdId   | StudentFormComponent    |
| /teacher                | Teacher (list)          |
| /teachers/create        | TeacherFormComponent    |
| /teachers/edit/:id      | TeacherFormComponent    |

## Remaining
- [ ] Full end-to-end test with all 3 roles (ADMIN / TEACHER / USER)
- [ ] Optionally: confirm dialog could be made smarter (loading state while deleting)
- [ ] Verify 401/403 interceptor works in practice
- [ ] Verify field errors display inline
- [ ] Verify toasts fire on all actions

## Important Reminders
- Student operations use `stdId` (string like "STD-001")
- Teacher operations use `id` (numeric Long like 1, 2, 3)
- DELETE on both returns plain String — handle as text response, not JSON
- TEACHER role: can do all student ops, but teacher: read + update only (no create/delete)
- Frontend hides buttons by role, backend also enforces — show backend 403 message in toast

## Last Completed
- ✅ Backend: Spring JWT + RBAC complete
- ✅ Auth: register, login, verify email, forgot password, reset password
- ✅ Memory Bank: updated with CRUD feature requirements

*Last updated: [fill when resuming]*