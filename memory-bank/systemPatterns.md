# System Patterns

## Architecture
```
Angular SPA (port 4200)  <——JSON——>  Spring Boot (port 8080)
  Angular Router                      JWT + RBAC
  AuthService                         Roles: ADMIN, TEACHER, USER
  HttpInterceptor (auth + errors)
  Reactive Forms
  Toast Notifications
```

---

## Angular Project Structure
```
src/app/
├── core/
│   ├── interceptors/
│   │   └── auth.interceptor.ts        ← attach token, handle 401/403
│   ├── services/
│   │   ├── auth.service.ts            ← login, logout, register, profile, token state
│   │   ├── student.service.ts         ← all student API calls
│   │   └── teacher.service.ts         ← all teacher API calls
│   ├── guards/
│   │   └── auth.guard.ts              ← protect routes that need login
│   └── models/
│       ├── student.model.ts           ← StudentRequest, StudentResponse interfaces
│       ├── teacher.model.ts           ← TeacherRequest, TeacherResponse interfaces
│       └── error.model.ts             ← ApiError, FieldErrors interfaces
│
├── shared/
│   ├── components/
│   │   ├── navbar/                    ← top navbar: Student | Teacher | auth state
│   │   ├── toast/                     ← notification display (if custom)
│   │   └── confirm-dialog/            ← reusable delete confirm modal
│   └── services/
│       └── toast.service.ts           ← show success/error/info toasts
│
├── features/
│   ├── auth/
│   │   ├── auth.component.ts          ← login + register toggled (same component)
│   │   ├── verify-email.component.ts
│   │   ├── forgot-password.component.ts
│   │   └── reset-password-otp.component.ts
│   │
│   ├── student/
│   │   ├── student-list.component.ts  ← shows all students as cards + Create btn
│   │   └── student-form.component.ts  ← create AND edit (same form, mode driven by route)
│   │
│   └── teacher/
│       ├── teacher-list.component.ts  ← shows all teachers as cards + Create btn
│       └── teacher-form.component.ts  ← create AND edit (same form, mode driven by route)
│
├── home/
│   └── home.component.ts              ← landing page, student/teacher previews
│
└── app.routes.ts                      ← all routes defined here
```

---

## Route Map

| Route                        | Component                | Auth Guard | Notes                              |
|------------------------------|--------------------------|------------|------------------------------------|
| `/`                          | HomeComponent            | No         | Public, shows user info if logged in |
| `/auth`                      | AuthComponent            | No         | Login + Register toggled           |
| `/verify-email`              | VerifyEmailComponent     | No         | 6-digit OTP after register         |
| `/forgot-password`           | ForgotPasswordComponent  | No         | Email input                        |
| `/reset-password/otp`        | ResetPasswordOtpComponent| No         | OTP + new password                 |
| `/students`                  | StudentListComponent     | No         | All roles + public can read        |
| `/students/create`           | StudentFormComponent     | Yes        | ADMIN, TEACHER only                |
| `/students/edit/:stdId`      | StudentFormComponent     | Yes        | ADMIN, TEACHER only                |
| `/teachers`                  | TeacherListComponent     | No         | All roles + public can read        |
| `/teachers/create`           | TeacherFormComponent     | Yes        | ADMIN only                         |
| `/teachers/edit/:id`         | TeacherFormComponent     | Yes        | ADMIN, TEACHER only                |

---

## Navbar Layout
```
[Logo: Authify]   [Student]   [Teacher]   ........  [Sign In] OR [name] [Logout]
```
- Student and Teacher links always visible to everyone
- Clicking Student → `/students` | Clicking Teacher → `/teachers`
- Active route → link gets blue color + underline (use routerLinkActive)
- If logged in: show user's name/email + Logout button
- If not logged in: show Sign In button

---

## Student List Page (`/students`)

```
[ Page Title: Students ]                           [ + Create Student ] ← show only if ADMIN or TEACHER

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ ID: STD-001     │  │ ID: STD-002     │  │ ID: STD-003     │
│ John Doe        │  │ Jane Smith      │  │ ...             │
│ Roll: 1001      │  │ Roll: 1002      │  │                 │
│ Gender: MALE    │  │ Gender: FEMALE  │  │                 │
│ [Edit] [Delete] │  │ [Edit] [Delete] │  │                 │  ← show only if permitted
└─────────────────┘  └─────────────────┘  └─────────────────┘
```
- Cards in a responsive grid (3 cols desktop, 2 tablet, 1 mobile)
- Edit button → navigate to `/students/edit/:stdId`
- Delete button → show confirm dialog → call DELETE API → show toast → refresh list
- Show Edit/Delete only if user has permission (ADMIN or TEACHER for student ops)
- Show Create button only if ADMIN or TEACHER

---

## Teacher List Page (`/teachers`)

```
[ Page Title: Teachers ]                           [ + Create Teacher ] ← ADMIN only

┌─────────────────┐  ┌─────────────────┐
│ ID: TCH-001     │  │ ID: TCH-002     │
│ Jane Smith      │  │ John Doe        │
│ Exp: 5 yrs      │  │ Exp: 3 yrs      │
│ Qual: M.Sc      │  │ Qual: B.Ed      │
│ Gender: FEMALE  │  │ Gender: MALE    │
│ [Edit] [Delete] │  │ [Edit] [Delete] │  ← Edit: ADMIN+TEACHER | Delete: ADMIN only
└─────────────────┘  └─────────────────┘
```
- Same card grid layout as students
- Edit → `/teachers/edit/:id`
- Delete → confirm dialog → DELETE → toast → refresh
- Create button: ADMIN only
- Edit button: ADMIN + TEACHER
- Delete button: ADMIN only

---

## Student Form Component (Create + Edit — SAME component)

```
Route: /students/create  → mode = 'create', form is empty
Route: /students/edit/:stdId → mode = 'edit', form pre-filled from GET /getStudentByStdId/:stdId

Title changes: "Create Student" OR "Edit Student"
Submit btn changes: "Create" OR "Update"
```

### Form Fields
```
First Name *     [________________]   ← required
Last Name *      [________________]   ← required
Roll No *        [________________]   ← required, numbers only
Gender *         [Dropdown: MALE / FEMALE / OTHER]
```
- Show field-level error under each input (from backend OR frontend validator)
- Cancel button → navigate back to `/students`
- On success: toast + navigate to `/students`

---

## Teacher Form Component (Create + Edit — SAME component)

```
Route: /teachers/create  → mode = 'create', empty form
Route: /teachers/edit/:id → mode = 'edit', pre-filled from GET /getTeacherById/:id

Title: "Create Teacher" OR "Edit Teacher"
```

### Form Fields
```
First Name *       [________________]   required
Last Name *        [________________]   required
Phone Number *     [________________]   required, exactly 10 digits
Experience (yrs) * [________________]   required, min 1
Qualification *    [________________]   required
Gender *           [Dropdown: MALE / FEMALE / OTHER]
```
- Same field-error display pattern as student form
- Cancel → `/teachers`
- On success: toast + navigate to `/teachers`

---

## Auth Interceptor Pattern

```typescript
// core/interceptors/auth.interceptor.ts
intercept(req, next) {
  const token = localStorage.getItem('token');
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next.handle(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        toastService.error(err.error?.message || 'Session expired. Please login');
        authService.logout();
        router.navigate(['/auth']);
      }
      if (err.status === 403) {
        toastService.error(err.error?.message || 'You do not have permission');
        // stay on page, just show toast
      }
      return throwError(() => err);
    })
  );
}
```

---

## Form Error Handling Pattern (Reactive Forms)

```typescript
// In component:
fieldErrors: { [key: string]: string } = {};

onSubmit() {
  if (this.form.invalid) {
    // show frontend validation errors
    this.form.markAllAsTouched();
    return;
  }
  this.service.create(this.form.value).subscribe({
    next: () => { this.toast.success('Created successfully'); this.router.navigate(['/students']); },
    error: (err) => {
      const data = err.error;
      if (data?.status === 403) return; // interceptor handles this
      if (data?.status === 401) return; // interceptor handles this
      // Field validation errors (flat object)
      if (data && !data.status && typeof data === 'object') {
        this.fieldErrors = data;  // { firstName: "First name is required" }
        return;
      }
      this.toast.error(data?.message || 'Something went wrong');
    }
  });
}
```

```html
<!-- In template for each field -->
<input formControlName="firstName" [class.border-red-500]="fieldErrors['firstName'] || (form.get('firstName')?.invalid && form.get('firstName')?.touched)" />
<p *ngIf="fieldErrors['firstName']" class="text-red-500 text-sm mt-1">{{ fieldErrors['firstName'] }}</p>
<p *ngIf="!fieldErrors['firstName'] && form.get('firstName')?.invalid && form.get('firstName')?.touched" class="text-red-500 text-sm mt-1">
  First name is required
</p>
```

---

## Permission Check Helper (in AuthService)

```typescript
get userRole(): string { return this.currentUser?.role || ''; }
get isAdmin(): boolean { return this.userRole === 'ADMIN'; }
get isTeacher(): boolean { return this.userRole === 'TEACHER'; }
get isUser(): boolean { return this.userRole === 'USER'; }

// Student permissions
get canCreateStudent(): boolean { return this.isAdmin || this.isTeacher; }
get canEditStudent(): boolean   { return this.isAdmin || this.isTeacher; }
get canDeleteStudent(): boolean { return this.isAdmin; }

// Teacher permissions
get canCreateTeacher(): boolean { return this.isAdmin; }
get canEditTeacher(): boolean   { return this.isAdmin || this.isTeacher; }
get canDeleteTeacher(): boolean { return this.isAdmin; }
```

---

## Toast Notification Rules

Install: `npm install ngx-toastr`

| Action                       | Type    | Message                                       |
|------------------------------|---------|-----------------------------------------------|
| Student created              | success | "Student created successfully"                |
| Student updated              | success | "Student updated successfully"                |
| Student deleted              | success | "Student deleted successfully"                |
| Teacher created              | success | "Teacher created successfully"                |
| Teacher updated              | success | "Teacher updated successfully"                |
| Teacher deleted              | success | "Teacher deleted successfully"                |
| 403 Permission denied        | error   | backend message (from err.error.message)      |
| 401 Unauthorized             | error   | backend message + redirect to /auth           |
| Login success                | success | "Welcome back, [name]!"                       |
| Register success             | success | "Account created! Check your email for OTP"   |
| Email verified               | success | "Email verified! You can now login"           |
| Password reset               | success | "Password reset! Please login"                |
| Logout                       | info    | "You have been logged out"                    |
| Any unhandled error          | error   | err.error?.message or "Something went wrong"  |

---

## UI Theme — Simple Clean Light Style

### ❌ NEVER USE (AI over-design):
- NO dark backgrounds, NO gradients, NO glow effects
- NO hero sections with giant text
- NO glass-morphism, NO blobs, NO particles
- NO pill-shaped buttons (border-radius 999px)
- NO purple/dark violet color scheme

### ✅ Tailwind Classes to Use
```
Page background:   bg-gray-50
Navbar:            bg-white border-b border-gray-200 shadow-sm
Cards:             bg-white border border-gray-200 rounded-lg p-4 shadow-sm
Form container:    bg-white border border-gray-200 rounded-lg p-6 max-w-lg mx-auto mt-8
Input base:        w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
Input error:       border-red-500 bg-red-50
Error text:        text-red-500 text-xs mt-1
Label:             block text-sm font-medium text-gray-700 mb-1
Primary button:    bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium
Secondary button:  bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm
Danger button:     bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm
Nav link active:   text-blue-600 font-medium border-b-2 border-blue-600
Nav link:          text-gray-600 hover:text-gray-900 text-sm font-medium
Page title:        text-xl font-semibold text-gray-900 mb-6
Card grid:         grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4
```