import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { StudentService } from '../../services/student.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { StudentRes } from '../../core/models/student.model';
import { PagedResponse } from '../../core/models/pagination.model';
import { StudentQueryParams } from '../../core/models/student-query.model';

@Component({
  selector: 'app-student',
  imports: [NavbarComponent, ConfirmDialogComponent, RouterLink, FormsModule, UpperCasePipe],
  templateUrl: './student.html',
  styleUrl: './student.css',
})
export class Student implements OnInit, OnDestroy {
  // ── Paginated data ───────────────────────────────
  pagedData: PagedResponse<StudentRes> | null = null;
  studentList: StudentRes[] = [];
  isLoading = false;
  loadError = '';

  // ── Filter & sort state ──────────────────────────
  pageNo    = 1;
  pageSize  = 9;
  sortBy    = 'id';
  sortDir   = 'asc';
  search    = '';

  readonly sortByOptions  = ['id', 'username', 'rollNo', 'gender'];
  readonly sortDirOptions = ['asc', 'desc'];

  // ── Search debounce ──────────────────────────────
  private searchSubject = new Subject<string>();
  private destroy$      = new Subject<void>();

  // ── Confirm delete ───────────────────────────────
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
    // Throttle text input — 500ms before triggering search
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.pageNo = 1;
      this.loadStudents();
    });

    this.loadStudents();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Permission helpers ───────────────────────────
  private get role(): string {
    return (this.auth.getRoleFromToken() ?? '').toUpperCase();
  }

  private canMutateStudent(): boolean {
    return !this.role.includes('USER');
  }

  // ── Data loading ─────────────────────────────────
  loadStudents(): void {
    this.isLoading = true;
    this.loadError = '';
    this.cdr.detectChanges();

    const query: StudentQueryParams = {
      pageNo: this.pageNo,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortDir: this.sortDir,
      search: this.search,
    };

    this.studentService.getAllStudents(query).subscribe({
      next: (res) => {
        this.pagedData   = res;
        this.studentList = res.data ?? [];
        this.isLoading   = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 0) {
          this.loadError = 'Cannot reach the server. Make sure the backend is running on port 8080.';
        } else {
          this.loadError = err.error?.message ?? `Error ${err.status}: Failed to load students.`;
        }
        this.cdr.detectChanges();
      },
    });
  }

  // Kept for template retry button compatibility
  getAllStudents(): void {
    this.pageNo = 1;
    this.loadStudents();
  }

  // ── Filter events ─────────────────────────────────
  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  onSortByChange(): void {
    this.pageNo = 1;
    this.loadStudents();
  }

  onSortDirChange(): void {
    this.pageNo = 1;
    this.loadStudents();
  }

  // ── Pagination ────────────────────────────────────
  goToPage(page: number): void {
    if (page < 1 || (this.pagedData && page > this.pagedData.totalPages)) return;
    this.pageNo = page;
    this.loadStudents();
  }

  prevPage(): void {
    if (!this.pagedData?.firstPage) this.goToPage(this.pageNo - 1);
  }

  nextPage(): void {
    if (!this.pagedData?.lastPage) this.goToPage(this.pageNo + 1);
  }

  getPageNumbers(): number[] {
    const total   = this.pagedData?.totalPages ?? 0;
    const current = this.pageNo;
    const max     = 5;
    const half    = Math.floor(max / 2);
    let start     = Math.max(1, current - half);
    let end       = Math.min(total, start + max - 1);
    if (end - start < max - 1) start = Math.max(1, end - max + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
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
        this.selectedStudent = null;
        // Reload from page 1 after delete
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

  // ── Template helpers ──────────────────────────────
  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get totalElements(): number {
    return this.pagedData?.totalElements ?? 0;
  }

  /** True when any filter is active — used to highlight filter inputs */
  get hasActiveFilter(): boolean {
    return this.search.trim().length > 0;
  }

  getInitials(fullName: string | null | undefined): string {
    if (!fullName) return '?';
    return fullName.trim().split(/\s+/).filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  }

  getGenderClass(gender: string | null | undefined): string {
    const g = (gender ?? '').toLowerCase();
    return ['male', 'female', 'other'].includes(g) ? g : 'other';
  }

  /** Formats ISO LocalDateTime string to a readable date */
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
