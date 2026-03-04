import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-payment-cancel',
    template: `
    <div class="payment-result cancel">
      <div class="card">
        <i class="fa fa-times-circle icon"></i>
        <h1>Payment Cancelled</h1>
        <p>Your payment was not completed. No charges were made.</p>
        <button (click)="goBack()" class="btn">Try Again</button>
      </div>
    </div>
  `,
    styles: [`
    .payment-result {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
    }
    .card {
      background: white;
      padding: 48px;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      max-width: 400px;
    }
    .icon {
      font-size: 64px;
      color: #ef4444;
      margin-bottom: 24px;
    }
    h1 { margin-bottom: 16px; color: #1e293b; }
    p { color: #64748b; margin-bottom: 32px; }
    .btn {
      background: #64748b;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
  `]
})
export class PaymentCancelComponent {
    constructor(private router: Router) { }
    goBack() { this.router.navigate(['/owner/subscription']); }
}
