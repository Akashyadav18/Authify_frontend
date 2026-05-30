import { Component, OnInit, ViewChild, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { OtpInputComponent } from '../../shared/components/otp-input/otp-input.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, OtpInputComponent],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  @ViewChild(OtpInputComponent) otpInput!: OtpInputComponent;

  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  email = '';
  otp = signal('');
  newPassword = '';
  confirmPassword = '';
  loading = signal(false);
  error = signal('');

  ngOnInit() {
    this.email = sessionStorage.getItem('resetEmail') ?? '';
    if (!this.email) this.router.navigate(['/forgot-password']);
  }

  onOtpComplete(value: string) {
    this.otp.set(value);
  }

  resetPassword() {
    if (this.otp().length !== 6) {
      this.error.set('Please enter the complete 6-digit OTP.');
      return;
    }
    if (!this.newPassword) {
      this.error.set('Please enter a new password.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.auth
      .resetPassword({ email: this.email, otp: this.otp(), newPassword: this.newPassword })
      .subscribe({
        next: () => {
          sessionStorage.removeItem('resetEmail');
          this.toast.success('Password reset! Please login with your new password.');
          this.router.navigate(['/auth']);
        },
        error: (err) => {
          this.loading.set(false);
          const msg = err?.error?.message ?? 'Reset failed. Check your OTP and try again.';
          this.error.set(msg);
          this.toast.error(msg);
          this.otpInput?.reset();
          this.otp.set('');
        },
      });
  }
}
