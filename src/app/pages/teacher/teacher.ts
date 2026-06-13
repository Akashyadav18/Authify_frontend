import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { TeacherService } from '../../services/teacher.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { TeacherRes } from '../../core/models/teacher.model';
import { PagedResponse, TeacherQueryParams } from '../../core/models/pagination.model';

@Component({
  selector: 'app-teacher',
  imports: [NavbarComponent, ConfirmDialogComponent, RouterLink, FormsModule],
  templateUrl: './teacher.html',
  styleUrl: './teacher.css',
})
export class Teacher implements OnInit, OnDestroy {
  // ── Paged data ────────────────────────────────────
  pagedResponse: PagedResponse<TeacherRes> | null = null;
  isLoading = false;
  loadError = '';

  // ── Filter / Sort state ───────────────────────────
  pageNo = 1;
  pageSize = 9;
  sortBy = 'id';
  sortDir = 'ASC';
  filterId = '';
  filterName = '';
  filterQual = '';
  startDate = '';
  endDate = '';

  sortByOptions = ['id', 'firstName', 'lastName', 'qualification'];
  sortDirOptions = ['ASC', 'DESC'];

  // ── Debounce ──────────────────────────────────────
  private nameSubject = new Subject<string>();
  private qualSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // ── Delete confirm ────────────────────────────────
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
    // Wire up debounce for text inputs (name + qualification)
    merge(
      this.nameSubject.pipe(debounceTime(400), distinctUntilChanged()),
      this.qualSubject.pipe(debounceTime(400), distinctUntilChanged()),
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageNo = 1;
        this.loadTeachers();
      });

    this.loadTeachers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Permission helpers ────────────────────────────
  private get role(): string {
    return (this.auth.getRoleFromToken() ?? '').toUpperCase();
  }

  private canCreateTeacher(): boolean {
    return this.role.includes('ADMIN');
  }

  private canUpdateTeacher(): boolean {
    return this.role.includes('ADMIN');
  }

  private canDeleteTeacher(): boolean {
    return this.role.includes('ADMIN');
  }

  // ── Data loading ──────────────────────────────────
  loadTeachers(): void {
    this.isLoading = true;
    this.loadError = '';
    this.cdr.detectChanges();

    const params: TeacherQueryParams = {
      pageNo: this.pageNo,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortDir: this.sortDir,
      id: this.filterId,
      name: this.filterName,
      qualification: this.filterQual,
      startDate: this.startDate,
      endDate: this.endDate,
    };

    this.teacherService.getAllTeachers(params).subscribe({
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

  // ── Filter/Sort handlers ──────────────────────────
  onNameInput() {
    this.nameSubject.next(this.filterName);
  }

  onQualInput() {
    this.qualSubject.next(this.filterQual);
  }

  /** ID input — immediate (not debounced, user typically enters a specific number) */
  onIdChange() {
    this.pageNo = 1;
    this.loadTeachers();
  }

  /** Date change — immediate */
  onDateChange() {
    this.pageNo = 1;
    this.loadTeachers();
  }

  onSortChange() {
    this.pageNo = 1;
    this.loadTeachers();
  }

  // ── Pagination ────────────────────────────────────
  onPageChange(page: number) {
    if (page < 1 || page > (this.pagedResponse?.totalPages ?? 1)) return;
    this.pageNo = page;
    this.loadTeachers();
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
  get teacherList(): TeacherRes[] {
    return this.pagedResponse?.data ?? [];
  }

  // ── Actions ───────────────────────────────────────
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
