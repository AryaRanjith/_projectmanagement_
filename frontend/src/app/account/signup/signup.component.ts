import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  registrationData = {
    org_name: '',
    org_email: '',
    owner_email: '',
    password: ''
  };

  errorMessage = '';
  isProcessing = false;
  planIdFromQuery: number | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['planId']) {
        this.planIdFromQuery = +params['planId'];
      }
    });
  }

  onSignupSubmit(): void {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.errorMessage = '';

    this.authService.signup(this.registrationData).subscribe({
      next: (onboardedUser: any) => {
        this.authService.saveToken(onboardedUser);

        if (this.planIdFromQuery) {
          // If they came from a specific plan, go back to pricing to trigger payment
          // or we could navigate directly if we had a plan detail page
          this.router.navigate(['/pricing']);
        } else {
          this.router.navigate(['/owner']);
        }
        this.isProcessing = false;
      },
      error: (serverError) => {
        this.errorMessage = serverError.error?.detail || 'We encountered an issue creating your account. Please try again.';
        this.isProcessing = false;
      }
    });
  }
}
