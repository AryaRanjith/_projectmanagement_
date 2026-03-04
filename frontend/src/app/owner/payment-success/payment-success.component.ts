import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';

@Component({
  selector: 'app-payment-success',
  template: `
    <div class="payment-result success">
      <div class="card">
        <div *ngIf="loading" class="loader">
           <i class="fa fa-spinner fa-spin icon"></i>
           <p>Updating your subscription...</p>
        </div>
        <div *ngIf="!loading">
          <i class="fa fa-check-circle icon"></i>
          <h1>Payment Successful!</h1>
          <p>Thank you for your subscription. Your features are now unlocked.</p>
          <button (click)="goDashboard()" class="btn">Go to Dashboard</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-result {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }
    .card {
      background: white;
      padding: 60px 48px;
      border-radius: 24px;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      width: 100%;
      max-width: 450px;
      animation: slideUp 0.6s ease-out;
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .icon {
      font-size: 72px;
      color: #10b981;
      margin-bottom: 24px;
      filter: drop-shadow(0 4px 6px rgba(16, 185, 129, 0.2));
    }
    h1 { 
      margin-bottom: 16px; 
      color: #1e293b; 
      font-size: 28px;
      font-weight: 800;
    }
    p { 
      color: #64748b; 
      margin-bottom: 40px; 
      font-size: 16px;
      line-height: 1.6;
    }
    .btn {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white;
      border: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 16px;
      cursor: pointer;
      width: 100%;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
      filter: brightness(1.1);
    }
    .btn:active {
      transform: translateY(0);
    }
    .loader { padding: 40px 0; }
    .loader p { margin-top: 16px; font-weight: 500; }
  `]
})
export class PaymentSuccessComponent implements OnInit {
  loading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private paymentService: PaymentService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const mockPlanId = params['mock_plan'];
      if (mockPlanId) {
        this.loading = true;
        this.paymentService.simulateSuccess(Number(mockPlanId)).subscribe({
          next: () => {
            this.loading = false;
            console.log('Mock payment processed');
          },
          error: (err: any) => {
            this.loading = false;
            console.error('Simulation failed', err);
          }
        });
      }
    });
  }

  goDashboard() { this.router.navigate(['/owner/dashboard']); }
}
