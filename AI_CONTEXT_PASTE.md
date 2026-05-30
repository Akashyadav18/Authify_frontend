# ⚡ Quick AI Context — Paste When Switching AI Tools

## Stack
Angular + Tailwind CSS frontend. Spring Boot JWT + RBAC backend (DONE).
Base URL: http://localhost:8080/api. Token: Authorization: Bearer <token> OR httpOnly cookie.

## Roles & Permissions
ADMIN   → Student: CRUD | Teacher: CRUD
TEACHER → Student: CRUD | Teacher: Read + Update only
USER    → Student: Read | Teacher: Read

## Student API
Request:  { firstName, lastName, rollNo(numbers only), gender(MALE|FEMALE|OTHER) }
Response: { id, stdId, username, fullName, rollNo, gender }
POST /api/createStudent (ADMIN+TEACHER) | GET /api/getAllStudents | GET /api/getStudentByStdId/{stdId}
PUT /api/updateStudent/{stdId} (ADMIN+TEACHER) | DELETE /api/deleteStudent/{stdId} (ADMIN) → String

## Teacher API
Request:  { firstName, lastName, phoneNumber(10 digits), experienceYear(min 1), qualification, gender }
Response: { id, teacherId, fullName, experienceYear, qualification, gender }
POST /api/createTeacher (ADMIN) | GET /api/getAllTeachers | GET /api/getTeacherById/{id}
PUT /api/updateTeacher/{id} (ADMIN+TEACHER) | DELETE /api/deleteTeacher/{id} (ADMIN) → String

⚠️ Student uses stdId (string), Teacher uses id (numeric Long)
⚠️ DELETE returns plain String — use responseType: 'text'

## Error Formats
403: { success:false, status:403, error:"Access Denied", message:"You do not have permission..." }
     → toast.error(message), stay on page
401: { success:false, status:401, error:"Unauthorized", message:"Authentication required..." }
     → toast.error(message) + logout + navigate /auth
Field errors: { "firstName": "First name is required" }
     → show INLINE under each input field (NOT toast)

## Routes
/students → StudentListComponent (cards grid, public)
/students/create → StudentFormComponent mode=create (ADMIN/TEACHER)
/students/edit/:stdId → StudentFormComponent mode=edit (ADMIN/TEACHER)
/teachers → TeacherListComponent (cards grid, public)
/teachers/create → TeacherFormComponent mode=create (ADMIN only)
/teachers/edit/:id → TeacherFormComponent mode=edit (ADMIN/TEACHER)

## Key Rules
- Create + Edit use SAME Angular component — detect mode from route param
- Edit mode: load data from getById → patchValue form
- Buttons hidden by role in template: *ngIf="authService.canCreateStudent"
- Toast on every action (ngx-toastr)
- UI: bg-gray-50 page, white cards, blue-600 buttons, border-gray-200 borders
- NO dark backgrounds, NO gradients, NO glow effects

## Current Task
[Paste memory-bank/activeContext.md here]