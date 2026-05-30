# Tech Context

## Backend (COMPLETE — DO NOT MODIFY)
- Spring Boot + JWT + RBAC
- Base URL: `http://localhost:8080`
- Common prefix: `/api`
- All requests: `Content-Type: application/json`
- All responses: JSON  *(except delete — returns plain String)*
- Token: `Authorization: Bearer <token>` header OR auto httpOnly cookie

---

## Auth APIs (already integrated — do not rebuild)

| Method | Endpoint                          | Auth | Body / Params                          |
|--------|-----------------------------------|------|----------------------------------------|
| POST   | /api/auth/register                | No   | { email, name, password, role }        |
| POST   | /api/auth/login                   | No   | { email, password }                    |
| POST   | /api/auth/verify-email            | No   | { otp } — 6 digit                      |
| POST   | /api/auth/reset-password?email=xx | No   | email as query param                   |
| POST   | /api/auth/reset-password          | No   | { otp, newPassword }                   |
| GET    | /api/user/profile                 | YES  | returns { email, name, role }          |

---

## Student APIs

### Enums
```
GenderEnum: MALE | FEMALE | OTHER
```

### StudentRequest (what frontend sends)
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "rollNo": "12345",
  "gender": "MALE"
}
```
Field rules (validate frontend-side if backend error not present):
- `firstName` — required string
- `lastName`  — required string
- `rollNo`    — required, numbers only (no letters), backend pattern validation
- `gender`    — required, one of: MALE, FEMALE, OTHER

### StudentResponse (what backend returns)
```json
{
  "id": 1,
  "stdId": "STD-001",
  "username": "john.doe",
  "fullName": "John Doe",
  "rollNo": "12345",
  "gender": "MALE"
}
```

### Student Endpoints

| Method | Endpoint                              | Auth      | Permission             | Body / Param        | Response         |
|--------|---------------------------------------|-----------|------------------------|---------------------|------------------|
| POST   | /api/createStudent                    | YES       | ADMIN, TEACHER         | StudentRequest JSON | StudentResponse  |
| GET    | /api/getAllStudents                    | Optional  | All (public read)      | —                   | StudentResponse[]|
| GET    | /api/getStudentByStdId/{stdId}        | Optional  | All (public read)      | stdId path param    | StudentResponse  |
| PUT    | /api/updateStudent/{stdId}            | YES       | ADMIN, TEACHER         | StudentRequest JSON | StudentResponse  |
| DELETE | /api/deleteStudent/{stdId}            | YES       | ADMIN only             | stdId path param    | String message   |

> getById / update / delete all use **stdId** (string like "STD-001")
> DELETE returns a plain String (not JSON object)

---

## Teacher APIs

### TeacherRequest (what frontend sends)
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "9876543210",
  "experienceYear": 5,
  "qualification": "M.Sc",
  "gender": "FEMALE"
}
```
Field rules (frontend validation + backend validation messages):
- `firstName`      — required | backend message: "First name is required"
- `lastName`       — required | backend message: "Last name is required"
- `phoneNumber`    — required, exactly 10 digits | backend message: "Phone number must be 10 digits"
- `experienceYear` — required, min 1 | backend message: "Experience year must be greater than 0"
- `qualification`  — required | backend message: "Qualification is required"
- `gender`         — required, one of: MALE, FEMALE, OTHER | backend message: "Gender is required, male, female and other"

### TeacherResponse (what backend returns)
```json
{
  "id": 1,
  "teacherId": "TCH-001",
  "fullName": "Jane Smith",
  "experienceYear": 5,
  "qualification": "M.Sc",
  "gender": "FEMALE"
}
```

### Teacher Endpoints

| Method | Endpoint                          | Auth      | Permission               | Body / Param          | Response         |
|--------|-----------------------------------|-----------|--------------------------|-----------------------|------------------|
| POST   | /api/createTeacher                | YES       | ADMIN only               | TeacherRequest JSON   | TeacherResponse  |
| GET    | /api/getAllTeachers                | Optional  | All (public read)        | —                     | TeacherResponse[]|
| GET    | /api/getTeacherById/{id}          | Optional  | All (public read)        | id (Long) path param  | TeacherResponse  |
| PUT    | /api/updateTeacher/{id}           | YES       | ADMIN, TEACHER           | TeacherRequest JSON   | TeacherResponse  |
| DELETE | /api/deleteTeacher/{id}           | YES       | ADMIN only               | id (Long) path param  | String message   |

> getById / update / delete all use **id** (numeric Long, e.g. 1, 2, 3)
> DELETE returns a plain String (not JSON object)

---

## Backend Error Response Formats

### 403 — Permission Denied
```json
{
  "success": false,
  "status": 403,
  "error": "Access Denied",
  "message": "You do not have permission to access this resource",
  "path": "/api/deleteStudent/STD-001"
}
```
Frontend must: show error toast with `data.message` — do NOT redirect.

### 401 — Unauthorized (not logged in)
```json
{
  "success": false,
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required. Please login first",
  "path": "/api/createStudent"
}
```
Frontend must: show error toast + clear auth state + redirect to `/auth`.

### Field Validation Errors
```json
{
  "firstName": "First name is required",
  "phoneNumber": "Phone number must be 10 digits"
}
```
Frontend must: show each message inline under its input field. NOT a toast.
If backend doesn't return field errors → show frontend validation messages.

---

## Frontend Stack
- **Framework:** Angular (latest)
- **Styles:** Tailwind CSS
- **HTTP:** Angular HttpClient
- **Routing:** Angular Router
- **Forms:** Angular Reactive Forms (FormGroup + Validators)
- **Notifications:** ngx-toastr (recommended) or a custom toast service
- **Auth Interceptor:** HttpInterceptor to attach token + handle 401/403

## Run Commands
- Backend: `mvn spring-boot:run` → `http://localhost:8080`
- Frontend: `ng serve` → `http://localhost:4200`