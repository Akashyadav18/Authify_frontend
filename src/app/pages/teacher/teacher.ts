import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { TeacherService } from '../../services/teacher.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { TeacherRes } from '../../core/models/teacher.model';

@Component({
  selector: 'app-teacher',
  imports: [NavbarComponent, ConfirmDialogComponent, RouterLink],
  templateUrl: './teacher.html',
  styleUrl: './teacher.css',
})
export class Teacher implements OnInit {
  teacherList: TeacherRes[] = [];
  isLoading = false;
  loadError = '';

  showConfirm = false;
  selectedTeacher: TeacherRes | null = null;

  constructor(
    private teacherService: TeacherService,
    private toast: ToastService,
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.getAllTeachers();
  }

  // ── Permission helpers ───────────────────────────
  private get role(): string {
    return (this.auth.getRoleFromToken() ?? '').toUpperCase();
  }

  /**
   * Teacher CRUD permissions (updated):
   *   ADMIN   → full CRUD on teachers
   *   TEACHER → Read only on teachers (no create, update or delete)
   *   USER    → Read only
   */
  private canCreateTeacher(): boolean {
    return this.role.includes('ADMIN');
  }

  private canUpdateTeacher(): boolean {
    return this.role.includes('ADMIN');
  }

  private canDeleteTeacher(): boolean {
    return this.role.includes('ADMIN');
  }

  // ── Data ─────────────────────────────────────────
  getAllTeachers(): void {
    this.isLoading = true;
    this.loadError = '';
    this.cdr.detectChanges();

    this.teacherService.getAllTeachers().subscribe({
      next: (res) => {
        this.teacherList = Array.isArray(res) ? res : [];
        this.isLoading = false;
        this.loadError = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.loadError = 'You must be logged in to view teachers.';
        } else if (err.status === 403) {
          this.loadError = 'You do not have permission to view teachers.';
        } else if (err.status === 0) {
          this.loadError = 'Cannot reach the server. Make sure the backend is running on port 8080.';
        } else {
          this.loadError = err.error?.message ?? `Error ${err.status}: Failed to load teachers.`;
        }
        this.cdr.detectChanges();
      },
    });
  }

  // ── Actions ──────────────────────────────────────
  onCreateTeacher(): void {
    if (!this.canCreateTeacher()) {
      this.toast.error('Only Admins can create new teachers.');
      return;
    }
    this.router.navigate(['/teachers/create']);
  }

  onUpdate(teacher: TeacherRes): void {
    if (!this.canUpdateTeacher()) {
      this.toast.error('You do not have permission to update teachers.');
      return;
    }
    this.router.navigate(['/teachers/edit', teacher.id]);
  }

  onDelete(teacher: TeacherRes): void {
    if (!this.canDeleteTeacher()) {
      this.toast.error('Only Admins can delete teachers.');
      return;
    }
    this.selectedTeacher = teacher;
    this.showConfirm = true;
  }

  confirmDelete(): void {
    if (!this.selectedTeacher) return;
    const id = this.selectedTeacher.id;
    this.showConfirm = false;
    this.teacherService.deleteTeacher(id).subscribe({
      next: () => {
        this.toast.success('Teacher deleted successfully.');
        this.teacherList = this.teacherList.filter((t) => t.id !== id);
        this.selectedTeacher = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Failed to delete teacher.');
        this.selectedTeacher = null;
      },
    });
  }

  cancelDelete(): void {
    this.showConfirm = false;
    this.selectedTeacher = null;
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
}
