import { Component, OnInit } from '@angular/core';
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
  constructor(
    private auth: AuthService,
    public userService: UserService,
    private router: Router,
    private toast: ToastService,
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

  logout() {
    this.auth.logout();
    this.userService.clearUser();
    this.toast.info('You have been logged out.');
    this.router.navigate(['/']);
  }
}
