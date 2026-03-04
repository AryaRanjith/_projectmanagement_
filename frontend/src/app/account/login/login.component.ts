import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Handles organization-level authentication.
 * Uses a glassmorphism design for a premium SaaS feel.
 */
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Input models
  email = '';
  password = '';
  rememberMe = false;

  // UI state management
  statusMessage = '';
  isLoading = false;
  showPassword = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.email = '';
    this.password = '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  ngOnInit(): void {
    // Aggressive clear after 100ms to catch browser pre-fills
    setTimeout(() => {
      this.email = '';
      this.password = '';
    }, 100);
  }

  /**
   * Triggers the authentication flow.
   * Redirects users based on their assigned role upon success.
   */
  onLoginSubmit(): void {
    if (this.isLoading) return;

    // Basic validation
    if (!this.email || !this.password) {
      this.statusMessage = 'Email and password are required.';
      return;
    }

    if (!this.validateEmailFormat(this.email)) {
      this.statusMessage = 'Please provide a valid email address.';
      return;
    }

    this.isLoading = true;
    this.statusMessage = '';

    const payload = {
      username: this.email,
      password: this.password
    };

    this.authService.login(payload).subscribe({
      next: (response: any) => {
        this.authService.saveToken(response);
        this.handleRoleBasedRedirection();
        this.isLoading = false;
      },
      error: (err) => {
        this.statusMessage = err.error?.detail || 'Authentication failed. Please verify your credentials.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Logic to route users to their respective dashboards.
   */
  private handleRoleBasedRedirection(): void {
    const userRole = this.authService.getRole();

    const routeMap: Record<string, string> = {
      'OWNER': '/owner',
      'EMPLOYEE': '/employee',
      'SUPERADMIN': '/admin/dashboard'
    };

    const targetRoute = routeMap[userRole] || '/account/login';
    this.router.navigate([targetRoute]);
  }

  private validateEmailFormat(email: string): boolean {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }
}