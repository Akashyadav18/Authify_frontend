import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { TeacherService } from '../../services/teacher.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { TeacherRes } from '../../core/models/teacher.model';
import { PagedResponse } from '../../core/models/pagination.model';
import { TeacherQueryParams } from '../../core/models/teacher-query.model';

@Component({
  selector: 'app-teacher',
  imports: [NavbarComponent, ConfirmDialogComponent, RouterLink, FormsModule],
  templateUrl: './teacher.html',
  styleUrl: './teacher.css',
})
export class Teacher implements OnInit, OnDestroy {
  // ── Paginated data ───────────────────────────────
  pagedData: PagedResponse<TeacherRes> | null = null;
  teacherList: TeacherRes[] = [];
  isLoading = false;
  loadError = '';

  // ── Filter & sort state ──────────────────────────
  pageNo = 1;
  pageSize = 9;
  sortBy = 'id';
  sortDir = 'ASC';
  filterId = '';          // input is string; parsed to number before sending
  filterName = '';
  filterQual = '';
  startDate = '';
  endDate = '';

  readonly sortByOptions = ['id', 'firstName', 'lastName', 'qualification', 'experienceYear', 'phoneNumber', 'gender'];
  readonly sortDirOptions = ['ASC', 'DESC'];

  // ── Debounce subjects ────────────────────────────
  private nameSubject = new Subject<string>();
  private qualSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // ── Confirm delete ───────────────────────────────
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
    // Throttle name input — 500ms before triggering search
    this.nameSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(() => { this.pageNo = 1; this.loadTeachers(); });

    // Throttle qualification input — 500ms before triggering search
    this.qualSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(() => { this.pageNo = 1; this.loadTeachers(); });

    this.loadTeachers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Permission helpers ───────────────────────────
  private get role(): string {
    return (this.auth.getRoleFromToken() ?? '').toUpperCase();
  }

  private canCreateTeacher(): boolean { return this.role.includes('ADMIN'); }
  private canUpdateTeacher(): boolean { return this.role.includes('ADMIN'); }
  private canDeleteTeacher(): boolean { return this.role.includes('ADMIN'); }

  // ── Data loading ─────────────────────────────────
  loadTeachers(): void {
    this.isLoading = true;
    this.loadError = '';
    this.cdr.detectChanges();

    const parsedId = this.filterId.trim() ? parseInt(this.filterId.trim(), 10) : undefined;

    const query: TeacherQueryParams = {
      pageNo: this.pageNo,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortDir: this.sortDir,
      id: parsedId,
      name: this.filterName,
      qualification: this.filterQual,
      startDate: this.startDate,
      endDate: this.endDate,
    };

    this.teacherService.getAllTeachers(query).subscribe({
      next: (res) => {
        this.pagedData = res;
        this.teacherList = res.data ?? [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 0) {
          this.loadError = 'Cannot reach the server. Make sure the backend is running on port 8080.';
        } else {
          this.loadError = err.error?.message ?? `Error ${err.status}: Failed to load teachers.`;
        }
        this.cdr.detectChanges();
      },
    });
  }

  // Kept for retry button compatibility
  getAllTeachers(): void {
    this.pageNo = 1;
    this.loadTeachers();
  }

  // ── Filter events ─────────────────────────────────
  onIdChange(): void { this.pageNo = 1; this.loadTeachers(); }
  onNameChange(v: string): void { this.nameSubject.next(v); }
  onQualChange(v: string): void { this.qualSubject.next(v); }
  onDateChange(): void { this.pageNo = 1; this.loadTeachers(); }
  onSortByChange(): void { this.pageNo = 1; this.loadTeachers(); }
  onSortDirChange(): void { this.pageNo = 1; this.loadTeachers(); }

  // ── Pagination ────────────────────────────────────
  goToPage(page: number): void {
    if (page < 1 || (this.pagedData && page > this.pagedData.totalPages)) return;
    this.pageNo = page;
    this.loadTeachers();
  }

  prevPage(): void { if (!this.pagedData?.firstPage) this.goToPage(this.pageNo - 1); }
  nextPage(): void { if (!this.pagedData?.lastPage) this.goToPage(this.pageNo + 1); }

  getPageNumbers(): number[] {
    const total = this.pagedData?.totalPages ?? 0;
    const current = this.pageNo;
    const max = 5;
    const half = Math.floor(max / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + max - 1);
    if (end - start < max - 1) start = Math.max(1, end - max + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
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
        this.selectedTeacher = null;
        this.pageNo = 1;
        this.loadTeachers();
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

  // ── Template helpers ──────────────────────────────
  get isLoggedIn(): boolean { return this.auth.isLoggedIn(); }

  get totalElements(): number { return this.pagedData?.totalElements ?? 0; }

  /** True when any filter is active — used to highlight filter inputs */
  get hasActiveFilter(): boolean {
    return !!(this.filterId.trim() || this.filterName.trim() || this.filterQual.trim() || this.startDate || this.endDate);
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
