import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';

@Component({
    selector: 'app-owner-checkout',
    templateUrl: './owner-checkout.component.html',
    styleUrls: ['./owner-checkout.component.css']
})
export class OwnerCheckoutComponent implements OnInit {
    planId: number | null = null;
    plan: any = null;
    loading = true;
    paymentMode: 'UPI' | 'CARD' | null = null;
    processing = false;
    upiId = '';
    qrGenerated = false;
    processingStatus = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private paymentService: PaymentService
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.planId = +params['id'];
            this.loadPlan();
        });
    }

    loadPlan(): void {
        this.paymentService.getPlans().subscribe({
            next: (plans) => {
                this.plan = plans.find(p => p.id === this.planId);
                this.loading = false;
            },
            error: () => this.loading = false
        });
    }

    selectMode(mode: 'UPI' | 'CARD'): void {
        this.paymentMode = mode;
        if (mode === 'UPI') {
            this.qrGenerated = true;
        }
    }

    processPayment(): void {
        if (this.paymentMode === 'UPI' && !this.upiId && this.qrGenerated === false) {
            return;
        }

        this.processing = true;
        this.processingStatus = 'Connecting to gateway...';

        setTimeout(() => this.processingStatus = 'Verifying account details...', 1000);
        setTimeout(() => this.processingStatus = 'Finalizing transaction...', 2000);

        // Simulate payment processing for 3 seconds
        setTimeout(() => {
            if (this.planId) {
                this.router.navigate(['/owner/payment-success'], {
                    queryParams: { mock_plan: this.planId }
                });
            }
        }, 3500);
    }

    cancel(): void {
        this.router.navigate(['/owner/subscription']);
    }
}
