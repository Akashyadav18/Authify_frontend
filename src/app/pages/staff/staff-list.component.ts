import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { StaffService } from '../../services/staff.service';
import { ToastService } from '../../core/services/toast.service';
import { StaffResponse } from '../../core/models/staff.model';

@Component({
  selector: 'app-staff-list',
  imports: [NavbarComponent, FormsModule],
  templateUrl: './staff-list.component.html',
  styleUrl: './staff-list.component.css',
})
export class StaffListComponent implements OnInit {
  // ── Accumulated data (keyset pagination appends) ──
  staffList: StaffResponse[] = [];
  nextCursor: number | null = null;
  hasNext = false;
  isLoading = false;
  loadError = '';

  // ── Size dropdown ────────────────────────────────
  selectedSize = 20;
  sizeOptions = [20, 50, 100];

  constructor(
    private staffService: StaffService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.loadInitial();
  }

  // ── Initial load (or reset after size change) ────
  loadInitial(): void {
    this.staffList = [];
    this.nextCursor = null;
    this.hasNext = false;
    this.fetchStaff();
  }

  // ── Load More click ──────────────────────────────
  loadMore(): void {
    this.fetchStaff();
  }

  // ── Shared fetch — always APPENDS to staffList ───
  fetchStaff(): void {
    this.isLoading = true;
    this.loadError = '';

    this.staffService.getAllStaffs(this.selectedSize, this.nextCursor).subscribe({
      next: (res) => {
        this.staffList = [...this.staffList, ...res.data];
        this.nextCursor = res.nextCursor;
        this.hasNext = res.hasNext;
        this.isLoading = false;
        this.cdr.detectChanges();

      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 0) {
          this.loadError = 'Cannot reach the server. Make sure the backend is running on port 8080.';
        } else {
          this.loadError = err.error?.message ?? `Error ${err.status}: Failed to load staff.`;
        }
        this.toast.error(this.loadError);
        this.cdr.detectChanges();
      },
    });
  }

  // ── Size dropdown change ─────────────────────────
  onSizeChange(): void {
    this.loadInitial();
  }

  // ── Helpers ──────────────────────────────────────
  getInitials(name: string | null | undefined): string {
    if (!name) return '?';
    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  }

  getRoleColor(role: string | null | undefined): string {
    const r = (role ?? '').toLowerCase();
    if (r.includes('admin') || r.includes('principal')) return 'role-admin';
    if (r.includes('teacher') || r.includes('librarian')) return 'role-teacher';
    if (r.includes('security') || r.includes('guard')) return 'role-security';
    if (r.includes('cleaner') || r.includes('peon')) return 'role-support';
    return 'role-default';
  }

  getSectionColor(section: string | null | undefined): string {
    const s = (section ?? '').toLowerCase();
    if (s === 'primary') return 'section-primary';
    if (s === 'secondary') return 'section-secondary';
    if (s === 'higher') return 'section-higher';
    return 'section-default';
  }
}
