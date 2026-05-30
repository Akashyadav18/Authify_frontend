# Project Brief

## Project Name
Authify — Spring JWT + RBAC Full Stack App

## Stack
- **Backend:** Spring Boot + JWT + Spring Security RBAC (COMPLETE — do not modify)
- **Frontend:** Angular + Tailwind CSS (in progress)

## Roles
| Role    | Student CRUD         | Teacher CRUD              |
|---------|----------------------|---------------------------|
| ADMIN   | All (C, R, U, D)     | All (C, R, U, D)          |
| TEACHER | All (C, R, U, D)     | Read + Update only        |
| USER    | Read only            | Read only                 |

> Anyone (even unauthenticated) can VIEW student and teacher lists.
> Write operations require the correct role.

## Two Main Sections
1. **Student** — navbar tab, manages student records
2. **Teacher** — navbar tab, manages teacher records

## Key Constraints
- Backend is JSON only (all req/res)
- Token via `Authorization: Bearer <token>` header OR auto httpOnly cookie
- Frontend: Angular + Tailwind CSS
- Errors come from backend — display them directly (field errors, 403, 401)
- Frontend validation only used when backend doesn't return a field error
- Notifications (toasts) on every create / update / delete / error action
- Delete operations for both Student and Teacher return a plain String response
- UI theme: simple, clean, light — NO dark themes, NO gradients, NO AI-generated look