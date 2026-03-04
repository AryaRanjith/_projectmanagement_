import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentService } from 'src/app/core/services/payment.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css']
})
export class SubscriptionComponent implements OnInit {
  plans: any[] = [];
  loading = true;
  error: string | null = null;
  selectedPlanId: number | null = null;

  constructor(
    private paymentService: PaymentService,
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetchPlans();
  }

  fetchPlans(): void {
    this.paymentService.getPlans().subscribe({
      next: (data) => {
        this.plans = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = `Failed to load subscription plans. Error: ${err.status} - ${err.message}`;
        this.loading = false;
        console.error('Error fetching plans:', err);
      }
    });
  }

  selectPlan(planId: number): void {
    this.selectedPlanId = planId;
  }

  subscribe(planId: number): void {
    this.selectedPlanId = planId;
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/account/signup'], { queryParams: { planId } });
      return;
    }

    this.paymentService.createCheckoutSession(planId).subscribe({
      next: (res: any) => {
        if (res.url) {
          window.location.href = res.url;
        }
      },
      error: (err) => {
        console.error('Checkout error:', err);
        if (err.status === 401) {
          alert('Your session has expired. Please log in again.');
          this.authService.logout();
        } else if (err.status === 404) {
          alert('The selected plan is no longer available.');
        } else {
          alert('Checkout failed! Please try again later.');
        }
      }
    });
  }
}
