import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InvitationService } from '../../core/services/invitation.service';
import { ToastService } from '../../core/services/toast.service';
import { SetupAccountRequest } from '../../core/models/invitation.model';

@Component({
  selector: 'app-setup-account',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './setup-account.component.html',
  styleUrl: './setup-account.component.css',
})
export class SetupAccountComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invitationService = inject(InvitationService);
  private toast = inject(ToastService);

  token = '';
  role = '';
  name = '';
  password = '';

  loading = signal(false);
  tokenMissing = signal(false);
  error = signal('');

  ngOnInit() {
    const params = this.route.snapshot.queryParamMap;
    this.token =
      params.get('token') ??
      params.get('t') ??
      this.route.snapshot.paramMap.get('token') ??
      '';
    this.role = params.get('role') ?? '';

    if (!this.token) {
      this.tokenMissing.set(true);
    }
  }

  onSubmit() {
    this.error.set('');

    if (!this.name.trim() || !this.password) {
      this.error.set('Please fill in both name and password.');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters.');
      return;
    }

    const req: SetupAccountRequest = {
      token: this.token,
      name: this.name.trim(),
      password: this.password,
    };

    this.loading.set(true);
    this.invitationService.setupAccount(req).subscribe({
      next: (_msg: string) => {
        this.loading.set(false);
        this.toast.success('Account setup complete! Please sign in.');
        this.router.navigate(['/auth']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.loading.set(false);
        const msg = err?.error?.message ?? 'Setup failed. The invitation link may have expired or is invalid.';
        this.error.set(msg);
        this.toast.error(msg);
      },
    });
  }
}
