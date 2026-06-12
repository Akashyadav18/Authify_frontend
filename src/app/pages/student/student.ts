import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { StudentService } from '../../services/student.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { StudentRes } from '../../core/models/student.model';

@Component({
  selector: 'app-student',
  imports: [NavbarComponent, ConfirmDialogComponent, RouterLink],
  templateUrl: './student.html',
  styleUrl: './student.css',
})
export class Student implements OnInit {
  studentList: StudentRes[] = [];
  isLoading = false;
  loadError = '';

  showConfirm = false;
  selectedStudent: StudentRes | null = null;

  constructor(
    private studentService: StudentService,
    private toast: ToastService,
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.getAllStudents();
  }

  // ── Permission helpers ───────────────────────────
  private get role(): string {
    return (this.auth.getRoleFromToken() ?? '').toUpperCase();
  }

  /**
   * Student CRUD permissions (matches with or without ROLE_ prefix, any case):
   *   ADMIN   → full CRUD
   *   TEACHER → full CRUD
   *   USER    → Read only (blocked)
   */
  private canMutateStudent(): boolean {
    const r = this.role;
    // Explicitly block USER role — let ADMIN, TEACHER, and unknown through
    if (r.includes('USER')) return false;
    return true;
  }

  // ── Data ─────────────────────────────────────────
  getAllStudents() {
    this.isLoading = true;
    this.loadError = '';
    this.cdr.detectChanges();

    this.studentService.getAllStudents().subscribe({
      next: (res) => {
        this.studentList = Array.isArray(res) ? res : [];
        this.isLoading = false;
        this.loadError = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.loadError = 'You must be logged in to view students.';
        } else if (err.status === 403) {
          this.loadError = 'You do not have permission to view students.';
        } else if (err.status === 0) {
          this.loadError = 'Cannot reach the server. Make sure the backend is running on port 8080.';
        } else {
          this.loadError = err.error?.message ?? `Error ${err.status}: Failed to load students.`;
        }
        this.cdr.detectChanges();
      },
    });
  }

  // ── Actions ──────────────────────────────────────
  onCreateStudent(): void {
    if (!this.canMutateStudent()) {
      this.toast.error('You do not have permission to create students.');
      return;
    }
    this.router.navigate(['/students/create']);
  }

  onUpdate(student: StudentRes): void {
    if (!this.canMutateStudent()) {
      this.toast.error('You do not have permission to update students.');
      return;
    }
    this.router.navigate(['/students/edit', student.stdId]);
  }

  onDelete(student: StudentRes): void {
    if (!this.canMutateStudent()) {
      this.toast.error('You do not have permission to delete students.');
      return;
    }
    this.selectedStudent = student;
    this.showConfirm = true;
  }

  confirmDelete(): void {
    if (!this.selectedStudent) return;
    const stdId = this.selectedStudent.stdId;
    this.showConfirm = false;
    this.studentService.deleteStudent(stdId).subscribe({
      next: () => {
        this.toast.success('Student deleted successfully.');
        this.studentList = this.studentList.filter((s) => s.stdId !== stdId);
        this.selectedStudent = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Failed to delete student.');
        this.selectedStudent = null;
      },
    });
  }

  cancelDelete(): void {
    this.showConfirm = false;
    this.selectedStudent = null;
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  getInitials(fullName: string | null | undefined): string {
    if (!fullName) return '?';
    return fullName.trim().split(/\s+/).filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  }

  getGenderClass(gender: string | null | undefined): string {
    const g = (gender ?? '').toLowerCase();
    return ['male', 'female', 'other'].includes(g) ? g : 'other';
  }

  /** Formats ISO LocalDateTime string (or Spring Boot array) to a readable date */
  formatDate(value: string | null | undefined): string {
    if (!value) return '—';
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return String(value);
      return d.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      });
    } catch {
      return String(value);
    }
  }
}
