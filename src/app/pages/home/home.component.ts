import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  userService = inject(UserService);

  loading = signal(false);

  get isLoggedIn() { return this.auth.isLoggedIn(); }
  get currentUser() { return this.userService.currentUser(); }

  get role(): string {
    return (this.auth.getRoleFromToken() ?? '').toUpperCase();
  }

  get roleLabel(): string {
    if (this.role.includes('ADMIN'))   return 'Admin';
    if (this.role.includes('TEACHER')) return 'Teacher';
    if (this.role.includes('USER'))    return 'Student';
    return 'Guest';
  }

  get roleBadgeClass(): string {
    if (this.role.includes('ADMIN'))   return 'badge-admin';
    if (this.role.includes('TEACHER')) return 'badge-teacher';
    if (this.role.includes('USER'))    return 'badge-user';
    return 'badge-guest';
  }

  ngOnInit() {
    if (this.isLoggedIn && !this.currentUser) {
      this.loading.set(true);
      this.userService.getProfile().subscribe({
        complete: () => { this.loading.set(false); this.cdr.detectChanges(); },
        error:    () => { this.loading.set(false); this.cdr.detectChanges(); },
      });
    }
  }
}
