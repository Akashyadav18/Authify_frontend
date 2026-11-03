import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  mobileMenuOpen = false;
  userDropdownOpen = false;

  constructor(
    private auth: AuthService,
    public userService: UserService,
    private router: Router,
    private toast: ToastService,
    private elRef: ElementRef,
  ) {}

  get isLoggedIn() {
    return this.auth.isLoggedIn();
  }

  get currentUser() {
    return this.userService.currentUser();
  }

  /** Normalised role: strips ROLE_ prefix, uppercases */
  get role(): string {
    return (
      this.auth.getNormalizedRole() ??
      (this.currentUser?.role ?? '').replace(/^ROLE_/i, '').toUpperCase()
    );
  }

  get isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  get isTeacher(): boolean {
    return this.role === 'TEACHER';
  }

  get canApprove(): boolean {
    return this.isAdmin || this.isTeacher || this.auth.hasPermission('APPROVE_USER');
  }

  get canInvite(): boolean {
    return this.isAdmin || this.auth.hasPermission('INVITE_USER');
  }

  get displayName(): string {
    return this.currentUser?.name || this.auth.getNameFromToken();
  }

  get displayEmail(): string {
    return this.currentUser?.email || this.auth.getEmailFromToken() || '';
  }

  ngOnInit() {
    if (this.isLoggedIn && !this.currentUser) {
      this.userService.getProfile().subscribe();
    }
  }

  getUserInitial(): string {
    const name = this.displayName;
    if (name) {
      return name.charAt(0).toUpperCase();
    }
    const email = this.displayEmail;
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      this.userDropdownOpen = false;
    }
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  toggleUserDropdown() {
    this.userDropdownOpen = !this.userDropdownOpen;
  }

  /** Close dropdowns when clicking outside the navbar component */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!this.elRef.nativeElement.contains(target)) {
      this.userDropdownOpen = false;
      this.mobileMenuOpen = false;
    }
  }

  logout() {
    this.auth.logout();
    this.userService.clearUser();
    this.toast.info('You have been logged out.');
    this.userDropdownOpen = false;
    this.mobileMenuOpen = false;
    this.router.navigate(['/']);
  }
}
