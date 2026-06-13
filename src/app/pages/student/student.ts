import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { StudentService } from '../../services/student.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { StudentRes } from '../../core/models/student.model';
import { PagedResponse, StudentQueryParams } from '../../core/models/pagination.model';

@Component({
  selector: 'app-student',
  imports: [NavbarComponent, ConfirmDialogComponent, RouterLink, FormsModule],
  templateUrl: './student.html',
  styleUrl: './student.css',
})
export class Student implements OnInit, OnDestroy {
  // ── Paged data ────────────────────────────────────
  pagedResponse: PagedResponse<StudentRes> | null = null;
  isLoading = false;
  loadError = '';

  // ── Filter / Sort state ───────────────────────────
  pageNo = 1;
  pageSize = 9;
  sortBy = 'id';
  sortDir = 'asc';
  search = '';

  sortByOptions = ['id', 'username', 'rollNo', 'gender'];
  sortDirOptions = ['asc', 'desc'];

  // ── Debounce ──────────────────────────────────────
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // ── Delete confirm ────────────────────────────────
  showConfirm = false;
  selectedStudent: StudentRes | null = null;

  constructor(
    private studentService: StudentService,
    private toast: ToastService,
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // Wire up search debounce
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageNo = 1;
        this.loadStudents();
      });

    this.loadStudents();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Permission helpers ────────────────────────────
  private get role(): string {
    return (this.auth.getRoleFromToken() ?? '').toUpperCase();
  }

  private canMutateStudent(): boolean {
    const r = this.role;
    if (r.includes('USER')) return false;
    return true;
  }

  // ── Data loading ──────────────────────────────────
  loadStudents() {
    this.isLoading = true;
    this.loadError = '';
    this.cdr.detectChanges();

    const params: StudentQueryParams = {
      pageNo: this.pageNo,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortDir: this.sortDir,
      search: this.search,
    };

    this.studentService.getAllStudents(params).subscribe({
      next: (res) => {
        this.pagedResponse = res;
        this.isLoading = false;
        this.loadError = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.pagedResponse = null;
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

  // ── Filter/Sort handlers ──────────────────────────
  onSearchInput() {
    this.searchSubject.next(this.search);
  }

  onSortChange() {
    this.pageNo = 1;
    this.loadStudents();
  }

  // ── Pagination ────────────────────────────────────
  onPageChange(page: number) {
    if (page < 1 || page > (this.pagedResponse?.totalPages ?? 1)) return;
    this.pageNo = page;
    this.loadStudents();
  }

  getPageNumbers(): number[] {
    const total = this.pagedResponse?.totalPages ?? 1;
    const maxPages = 5;
    const half = Math.floor(maxPages / 2);
    let start = Math.max(1, this.pageNo - half);
    let end = Math.min(total, start + maxPages - 1);
    if (end - start < maxPages - 1) start = Math.max(1, end - maxPages + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // ── Helpers ───────────────────────────────────────
  get studentList(): StudentRes[] {
    return this.pagedResponse?.data ?? [];
  }

  // ── Actions ───────────────────────────────────────
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
        this.selectedStudent = null;
        this.pageNo = 1;
        this.loadStudents();
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
