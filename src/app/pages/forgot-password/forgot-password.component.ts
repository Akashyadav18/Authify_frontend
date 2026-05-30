import { Component, ViewChild, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { OtpInputComponent } from '../../shared/components/otp-input/otp-input.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, OtpInputComponent],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  @ViewChild(OtpInputComponent) otpInput!: OtpInputComponent;

  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  // Step 1: email entry
  email = '';

  // Step 2: OTP + new password
  otp = signal('');
  newPassword = '';
  confirmPassword = '';

  // UI state
  step = signal<1 | 2>(1);
  loading = signal(false);
  error = signal('');
  success = signal('');

  // ── Step 1 ────────────────────────────────────────────────────────
  sendOtp() {
    if (!this.email) {
      this.error.set('Please enter your email address.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.auth.sendResetOtp(this.email).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('OTP sent! Check your inbox.');
        this.step.set(2);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message ?? 'Could not send OTP. Please try again.';
        this.error.set(msg);
        this.toast.error(msg);
      },
    });
  }

  // ── Step 2 ────────────────────────────────────────────────────────
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
          this.loading.set(false);
          this.toast.success('Password reset successfully! Welcome back 🎉');
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.loading.set(false);
          const msg = err?.error?.message ?? 'Invalid OTP or reset failed. Try again.';
          this.error.set(msg);
          this.toast.error(msg);
          this.otpInput?.reset();
          this.otp.set('');
        },
      });
  }

  goBack() {
    if (this.step() === 2) {
      this.step.set(1);
      this.error.set('');
      this.otp.set('');
      this.newPassword = '';
      this.confirmPassword = '';
    } else {
      this.router.navigate(['/auth']);
    }
  }
}
