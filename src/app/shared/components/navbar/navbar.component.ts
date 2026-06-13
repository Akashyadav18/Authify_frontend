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

  ngOnInit() {
    if (this.isLoggedIn && !this.currentUser) {
      this.userService.getProfile().subscribe();
    }
  }

  getUserInitial(): string {
    const user = this.currentUser;
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
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
