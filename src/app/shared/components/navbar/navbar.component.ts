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
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  /** Mobile menu open/close */
  mobileOpen = false;

  /** User dropdown (desktop + mobile) open/close */
  dropdownOpen = false;

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

  /** First name only — extracted from full name */
  get firstName(): string {
    const name = this.currentUser?.name ?? '';
    return name.split(' ')[0] || name;
  }

  ngOnInit() {
    if (this.isLoggedIn && !this.currentUser) {
      this.userService.getProfile().subscribe();
    }
  }

  toggleMobile() {
    this.mobileOpen = !this.mobileOpen;
    // Close user dropdown whenever mobile menu toggles
    this.dropdownOpen = false;
  }

  closeMobile() {
    this.mobileOpen = false;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  logout() {
    this.mobileOpen = false;
    this.dropdownOpen = false;
    this.auth.logout();
    this.userService.clearUser();
    this.toast.info('You have been logged out.');
    this.router.navigate(['/']);
  }

  /** Close dropdown / mobile menu when clicking outside the navbar */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
      this.mobileOpen = false;
    }
  }
}
