import { Component, ViewChild, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { OtpInputComponent } from '../../shared/components/otp-input/otp-input.component';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [OtpInputComponent],
  templateUrl: './verify-email.component.html',
})
export class VerifyEmailComponent {
  @ViewChild(OtpInputComponent) otpInput!: OtpInputComponent;

  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  otp = signal('');
  loading = signal(false);
  resending = signal(false);
  error = signal('');
  success = signal('');

  onOtpComplete(value: string) {
    this.otp.set(value);
  }

  verify() {
    if (this.otp().length !== 6) {
      this.error.set('Please enter the complete 6-digit OTP.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.auth.verifyEmail(this.otp()).subscribe({
      next: () => {
        this.toast.success('Email verified! Welcome aboard 🎉');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message ?? 'Invalid OTP. Please try again.';
        this.error.set(msg);
        this.toast.error(msg);
        this.otpInput?.reset();
        this.otp.set('');
      },
    });
  }

  resendOtp() {
    this.resending.set(true);
    this.error.set('');
    this.success.set('');
    this.auth.sendOtpVerifyEmail().subscribe({
      next: () => {
        this.resending.set(false);
        this.success.set('OTP resent! Check your inbox.');
        this.toast.info('OTP resent to your email.');
        this.otpInput?.reset();
        this.otp.set('');
      },
      error: () => {
        this.resending.set(false);
        const msg = 'Could not resend OTP. Please try again.';
        this.error.set(msg);
        this.toast.error(msg);
      },
    });
  }
}
