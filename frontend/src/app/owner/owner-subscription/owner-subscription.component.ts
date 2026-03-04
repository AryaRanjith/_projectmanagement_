import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OwnerService } from '../services/owner.service';
import { PaymentService } from '../../core/services/payment.service';

@Component({
    selector: 'app-owner-subscription',
    templateUrl: './owner-subscription.component.html',
    styleUrls: ['./owner-subscription.component.css']
})
export class OwnerSubscriptionComponent implements OnInit {
    subscription: any = null;
    plans: any[] = [];
    loading = true;
    processingPlan: number | null = null;

    constructor(
        private router: Router,
        private ownerService: OwnerService,
        private paymentService: PaymentService
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.loading = true;
        this.ownerService.getSubscriptionStatus().subscribe({
            next: (data) => {
                this.subscription = data;
                this.loading = false;
            },
            error: () => this.loading = false
        });

        this.paymentService.getPlans().subscribe({
            next: (data) => this.plans = data,
            error: () => console.error('Failed to load plans')
        });
    }

    subscribeToPlan(plan: any): void {
        this.processingPlan = plan.id;
        // Navigate to the realistic checkout simulation
        this.ownerService.getSubscriptionStatus().subscribe(() => {
            this.router.navigate(['/owner/checkout', plan.id]);
        });
    }

    isCurrentPlan(plan: any): boolean {
        return this.subscription?.plan_name === plan.name;
    }
}
