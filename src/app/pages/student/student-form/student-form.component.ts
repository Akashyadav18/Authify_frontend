import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { StudentService } from '../../../services/student.service';
import { ToastService } from '../../../core/services/toast.service';
import { StudentReq } from '../../../core/models/student.model';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [FormsModule, NavbarComponent],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.css',
})
export class StudentFormComponent implements OnInit {
  isEditMode = false;
  stdId: string | null = null;
  pageTitle = 'Add Student';

  firstName = '';
  lastName = '';
  rollNo = '';
  gender: 'MALE' | 'FEMALE' | 'OTHER' = 'MALE';

  isLoading = false;
  isSubmitting = false;
  fieldErrors: Record<string, string> = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.stdId = this.route.snapshot.paramMap.get('stdId');
    this.isEditMode = !!this.stdId;
    this.pageTitle = this.isEditMode ? 'Edit Student' : 'Add Student';

    if (this.isEditMode && this.stdId) {
      this.loadStudent(this.stdId);
    }
  }

  loadStudent(stdId: string): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.studentService.getStudentById(stdId).subscribe({
      next: (student) => {
        const name = student.fullName ?? '';
        const parts = name.trim().split(/\s+/).filter(Boolean);
        this.firstName = parts[0] ?? '';
        this.lastName = parts.slice(1).join(' ');
        this.rollNo = student.rollNo ?? '';
        this.gender = student.gender ?? 'MALE';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Failed to load student data.');
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/student']);
      },
    });
  }

  onSubmit(): void {
    this.fieldErrors = {};
    // Client-side validation only on CREATE — edit mode defers to backend
    if (!this.isEditMode) {
      if (!this.firstName.trim()) this.fieldErrors['firstName'] = 'First name is required.';
      if (!this.lastName.trim()) this.fieldErrors['lastName'] = 'Last name is required.';
      if (!this.rollNo.trim()) {
        this.fieldErrors['rollNo'] = 'Roll number is required.';
      } else if (!/^\d+$/.test(this.rollNo.trim())) {
        this.fieldErrors['rollNo'] = 'Roll number must contain numbers only.';
      }
      if (Object.keys(this.fieldErrors).length > 0) {
        this.cdr.detectChanges();
        return;
      }
    }

    const payload: StudentReq = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      rollNo: this.rollNo.trim(),
      gender: this.gender,
    };

    this.isSubmitting = true;
    this.cdr.detectChanges();

    if (this.isEditMode && this.stdId) {
      this.studentService.updateStudent(this.stdId, payload).subscribe({
        next: () => {
          this.toast.success('Student updated successfully!');
          this.router.navigate(['/student']);
        },
        error: (err) => {
          this.showAllBackendErrors(err);
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.studentService.createStudent(payload).subscribe({
        next: () => {
          this.toast.success('Student created successfully!');
          this.router.navigate(['/student']);
        },
        error: (err) => {
          this.showAllBackendErrors(err);
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

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
    if (data['message']) {
      if (hasFieldErrors) {
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
    this.cdr.detectChanges();
  }

  clearFieldError(field: string): void {
    delete this.fieldErrors[field];
  }

  onCancel(): void {
    this.router.navigate(['/student']);
  }
}
