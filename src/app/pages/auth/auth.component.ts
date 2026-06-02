import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { Role } from '../../core/models/user.model';

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

  // Login fields
  loginEmail = '';
  loginPassword = '';

  // Register fields
  regEmail = '';
  regName = '';
  regPassword = '';
  regRole: Role = 'USER';

  switchTab(tab: 'login' | 'register') {
    this.activeTab.set(tab);
    this.error.set('');
    this.success.set('');
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
        // Fetch profile to check accountVerified
        this.userService.getProfile().subscribe({
          next: (user) => {
            console.log("login....");
            if (!user.accountVerified) {
              // Email not verified — auto-send OTP then go to verify page
              this.toast.info(`Welcome ${user.name}! Sending OTP to verify your email…`);
              this.auth.sendOtpVerifyEmail().subscribe({
                complete: () => {
                  this.loading.set(false);
                  this.router.navigate(['/verify-email']);
                },
                error: () => {
                  // Navigate anyway — user can resend from verify page
                  this.loading.set(false);
                  this.router.navigate(['/verify-email']);
                },
              });
            } else {
              // Already verified — go home
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
      .register({ email: this.regEmail, name: this.regName, password: this.regPassword, role: this.regRole })
      .subscribe({
        next: () => {
          this.loading.set(false);
          console.log("registering....");
          this.success.set('Account created! Please login to verify your email.');
          this.toast.success('Account created! Please sign in.');
          // Switch to login tab — user will login and OTP is sent automatically
          this.switchTab('login');
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
