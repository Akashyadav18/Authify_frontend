# Product Context

## What This Feature Is
Full CRUD management for Students and Teachers, with role-based permissions enforced
on both the backend (Spring Security) and the frontend (hide/show buttons by role).

---

## User Journeys by Role

### ADMIN — Full Access

**Create Student:**
1. Click "Student" in navbar → `/students`
2. Click "+ Create Student" button (visible to ADMIN/TEACHER)
3. Navigate to `/students/create` (StudentFormComponent, mode=create)
4. Fill: firstName, lastName, rollNo (numbers only), gender
5. Submit → POST /api/createStudent
6. Toast: "Student created successfully" → navigate to `/students`

**Edit Student:**
1. On `/students` list, click "Edit" on a card
2. Navigate to `/students/edit/:stdId`
3. Form pre-filled from GET /api/getStudentByStdId/:stdId
4. Edit fields → Submit → PUT /api/updateStudent/:stdId
5. Toast: "Student updated successfully" → navigate to `/students`

**Delete Student:**
1. Click "Delete" on a student card
2. Confirm dialog appears: "Are you sure you want to delete this student?"
3. Confirm → DELETE /api/deleteStudent/:stdId
4. Toast: "Student deleted successfully" (backend returns String)
5. Card removed from list

**Create Teacher:**
1. Click "Teacher" in navbar → `/teachers`
2. Click "+ Create Teacher" (ADMIN only)
3. Navigate to `/teachers/create`
4. Fill all fields → Submit → POST /api/createTeacher
5. Toast + navigate to `/teachers`

**Edit/Delete Teacher:** same pattern, uses numeric `id`

---

### TEACHER — Restricted Access

**What TEACHER can do:**
- ✅ View all students and teachers (public)
- ✅ Create student (`/students/create`)
- ✅ Edit student (`/students/edit/:stdId`)
- ✅ Edit teacher (`/teachers/edit/:id`)
- ❌ Delete student → "Delete" button hidden
- ❌ Create teacher → "+ Create Teacher" button hidden
- ❌ Delete teacher → "Delete" button hidden

**If TEACHER tries a forbidden action (via URL):**
- Backend returns 403 → interceptor shows toast: backend message
- Stay on current page

---

### USER (Student) — Read Only

**What USER can do:**
- ✅ View all students (`/students`)
- ✅ View all teachers (`/teachers`)
- ❌ All write buttons are hidden

**If USER tries a write action (via URL):**
- Backend returns 403 → toast error → stay on page

---

### Unauthenticated User

**What they can do:**
- ✅ View all students and teachers (read is public)
- ❌ All write buttons hidden (no token = no role)
- If they hit a write endpoint → 401 → toast + redirect to `/auth`

---

## Form Page Behaviour (Create vs Edit — Same Component)

```
/students/create
  - Title: "Create Student"
  - Form: all fields empty
  - Submit button: "Create"
  - Success: toast + navigate to /students

/students/edit/:stdId
  - Title: "Edit Student"
  - On init: call GET /getStudentByStdId/:stdId → patch form values
  - Submit button: "Update"
  - Success: toast + navigate to /students

Same pattern for /teachers/create and /teachers/edit/:id
```

---

## Delete Confirmation Flow
1. User clicks "Delete" button on card
2. A simple confirm dialog/modal appears:
   - Title: "Confirm Delete"
   - Message: "Are you sure? This cannot be undone."
   - Buttons: [Cancel] [Delete] (red)
3. If confirmed → call DELETE API
4. Response is a plain String → show in toast as success
5. Remove item from list (refresh or filter from array)

---

## Permission-Driven UI Rules

| Element                        | Shown To                   |
|--------------------------------|----------------------------|
| Student "+ Create" button      | ADMIN, TEACHER             |
| Student "Edit" button on card  | ADMIN, TEACHER             |
| Student "Delete" button        | ADMIN only                 |
| Teacher "+ Create" button      | ADMIN only                 |
| Teacher "Edit" button on card  | ADMIN, TEACHER             |
| Teacher "Delete" button        | ADMIN only                 |
| All read/view content          | Everyone (incl. logged out)|

---

## UI Layout Rules

**List pages (`/students`, `/teachers`):**
- Page heading + Create button in same row (flex justify-between)
- Cards in responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop
- Each card shows all response fields + action buttons

**Form pages:**
- White card, max-w-lg, centered
- Title at top of card
- Fields stacked vertically with labels
- Error message under each field (backend first, then frontend)
- Two buttons at bottom: [Cancel] [Create/Update]
- Cancel navigates back to list

**Navbar:**
- Fixed at top, white, thin shadow
- Logo left, nav links center, auth actions right
- Student/Teacher links use routerLinkActive for active state