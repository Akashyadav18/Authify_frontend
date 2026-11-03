import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './auth.component.html',
})
export class AuthComponent {
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private toast = inject(ToastService);

  activeTab = signal<'login' | 'register'>('login');
  loading = signal(false);
  error = signal('');
  success = signal('');
  /** True after a successful self-registration — user must wait for approval */
  registrationPending = signal(false);

  // Login fields
  loginEmail = '';
  loginPassword = '';

  // Register fields
  regEmail = '';
  regName = '';
  regPassword = '';

  switchTab(tab: 'login' | 'register') {
    this.activeTab.set(tab);
    this.error.set('');
    this.success.set('');
    this.registrationPending.set(false);
  }

  onLogin() {
    if (!this.loginEmail || !this.loginPassword) {
      this.error.set('Please fill in all fields.');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.auth.login({ email: this.loginEmail, password: this.loginPassword }).subscribe({
      next: () => {
        // Initialize current user immediately from the JWT token
        this.userService.initFromToken();

        // Fetch profile to verify profile data and check email verification
        this.userService.getProfile().subscribe({
          next: (user) => {
            // Trigger OTP verify-email when backend explicitly marks account as not verified.
            // This covers both self-registered users AND invited users whose email
            // has not yet been confirmed (accountVerified === false).
            if (user.accountVerified === false) {
              this.toast.info(`Welcome ${user.name}! Sending OTP to verify your email…`);
              this.auth.sendOtpVerifyEmail().subscribe({
                complete: () => {
                  this.loading.set(false);
                  this.router.navigate(['/verify-email']);
                },
                error: () => {
                  // Even if OTP send fails, navigate so user can retry
                  this.loading.set(false);
                  this.router.navigate(['/verify-email']);
                },
              });
            } else {
              this.toast.success(`Welcome back, ${user.name}!`);
              this.loading.set(false);
              this.router.navigate(['/']);
            }
          },
          error: () => {
            this.toast.success('Login successful!');
            this.loading.set(false);
            this.router.navigate(['/']);
          },
        });
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message ?? 'Login failed. Check your credentials.';
        this.error.set(msg);
        this.toast.error(msg);
      },
    });
  }

  onRegister() {
    if (!this.regEmail || !this.regName || !this.regPassword) {
      this.error.set('Please fill in all fields.');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.auth
      .register({ email: this.regEmail, name: this.regName, password: this.regPassword })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.registrationPending.set(true);
          this.toast.success('Registration submitted! Waiting for admin/teacher approval.');
        },
        error: (err) => {
          this.loading.set(false);
          const msg = err?.error?.message ?? 'Registration failed. Please try again.';
          this.error.set(msg);
          this.toast.error(msg);
        },
      });
  }
}
