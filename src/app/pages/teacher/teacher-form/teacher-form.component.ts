import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { TeacherService } from '../../../services/teacher.service';
import { ToastService } from '../../../core/services/toast.service';
import { TeacherReq } from '../../../core/models/teacher.model';

@Component({
  selector: 'app-teacher-form',
  standalone: true,
  imports: [FormsModule, NavbarComponent],
  templateUrl: './teacher-form.component.html',
  styleUrl: './teacher-form.component.css',
})
export class TeacherFormComponent implements OnInit {
  isEditMode = false;
  teacherId: number | null = null;
  pageTitle = 'Add Teacher';

  firstName = '';
  lastName = '';
  phoneNumber = '';
  experienceYear: number | null = null;
  qualification = '';
  gender: 'MALE' | 'FEMALE' | 'OTHER' = 'MALE';

  isLoading = false;
  isSubmitting = false;
  fieldErrors: Record<string, string> = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teacherService: TeacherService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!idParam;
    this.teacherId = idParam ? Number(idParam) : null;
    this.pageTitle = this.isEditMode ? 'Edit Teacher' : 'Add Teacher';

    if (this.isEditMode && this.teacherId) {
      this.loadTeacher(this.teacherId);
    }
  }

  loadTeacher(id: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.teacherService.getTeacherById(id).subscribe({
      next: (teacher) => {
        const name = teacher.fullName ?? '';
        const parts = name.trim().split(/\s+/).filter(Boolean);
        this.firstName = parts[0] ?? '';
        this.lastName = parts.slice(1).join(' ');
        this.phoneNumber = (teacher as any).phoneNumber ?? '';
        this.experienceYear = teacher.experienceYear ?? null;
        this.qualification = teacher.qualification ?? '';
        this.gender = teacher.gender ?? 'MALE';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Failed to load teacher data.');
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/teacher']);
      },
    });
  }

  onSubmit(): void {
    this.fieldErrors = {};

    // Client-side validation only on CREATE mode
    // On EDIT mode skip all frontend validation — let the backend decide
    if (!this.isEditMode) {
      if (!this.firstName.trim()) this.fieldErrors['firstName'] = 'First name is required.';
      if (!this.lastName.trim()) this.fieldErrors['lastName'] = 'Last name is required.';
      if (!this.phoneNumber.trim()) {
        this.fieldErrors['phoneNumber'] = 'Phone number is required.';
      } else if (!/^\d{10}$/.test(this.phoneNumber.trim())) {
        this.fieldErrors['phoneNumber'] = 'Phone number must be exactly 10 digits.';
      }
      if (this.experienceYear === null || this.experienceYear === undefined) {
        this.fieldErrors['experienceYear'] = 'Experience year is required.';
      } else if (this.experienceYear < 1) {
        this.fieldErrors['experienceYear'] = 'Experience must be at least 1 year.';
      }
      if (!this.qualification.trim()) this.fieldErrors['qualification'] = 'Qualification is required.';

      if (Object.keys(this.fieldErrors).length > 0) {
        this.cdr.detectChanges();
        return;
      }
    }

    const payload: TeacherReq = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      phoneNumber: this.phoneNumber.trim(),
      experienceYear: this.experienceYear ?? 0,
      qualification: this.qualification.trim(),
      gender: this.gender,
    };

    this.isSubmitting = true;
    this.cdr.detectChanges();

    if (this.isEditMode && this.teacherId) {
      this.teacherService.updateTeacher(this.teacherId, payload).subscribe({
        next: () => {
          this.toast.success('Teacher updated successfully!');
          this.router.navigate(['/teacher']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.showAllBackendErrors(err);
          this.cdr.detectChanges();
        },
      });
    } else {
      this.teacherService.createTeacher(payload).subscribe({
        next: () => {
          this.toast.success('Teacher created successfully!');
          this.router.navigate(['/teacher']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.showAllBackendErrors(err);
          this.cdr.detectChanges();
        },
      });
    }
  }

  /**
   * Show ALL backend errors inline under each field.
   * If the error body contains field keys → show inline.
   * Any remaining message → also show as a global field error at the top ('_global').
   */
  showAllBackendErrors(err: any): void {
    const data = err.error;
    if (!data) {
      this.toast.error('Something went wrong. Please try again.');
      return;
    }

    const reservedKeys = new Set(['status', 'success', 'error', 'path', 'timestamp']);
    const newErrors: Record<string, string> = {};
    let hasFieldErrors = false;

    for (const key of Object.keys(data)) {
      if (!reservedKeys.has(key) && key !== 'message') {
        newErrors[key] = data[key];
        hasFieldErrors = true;
      }
    }

    // Also surface the top-level message as a global inline error
    if (data['message']) {
      if (hasFieldErrors) {
        // already showing field errors; show message as toast too
        this.toast.error(data['message']);
      } else {
        newErrors['_global'] = data['message'];
      }
    }

    if (Object.keys(newErrors).length === 0) {
      this.toast.error('Something went wrong. Please try again.');
      return;
    }

    this.fieldErrors = newErrors;
  }

  clearFieldError(field: string): void {
    delete this.fieldErrors[field];
  }

  onCancel(): void {
    this.router.navigate(['/teacher']);
  }
}
