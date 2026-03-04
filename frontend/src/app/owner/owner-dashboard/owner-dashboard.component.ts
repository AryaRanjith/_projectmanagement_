import { Component, OnInit, OnDestroy } from '@angular/core';
import { OwnerService } from '../services/owner.service';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-owner-dashboard',
    templateUrl: './owner-dashboard.component.html',
    styleUrls: ['./owner-dashboard.component.css']
})
export class OwnerDashboardComponent implements OnInit, OnDestroy {
    stats: any = null;
    subscription: any = null;
    loading = true;
    error: string | null = null;

    private updateSubscription: Subscription = new Subscription();

    constructor(private ownerService: OwnerService) { }

    ngOnInit(): void {
        this.loadSubscriptionStatus();

        // Initial load + Poll every 30 seconds
        this.updateSubscription = interval(30000)
            .pipe(
                startWith(0),
                switchMap(() => this.ownerService.getDashboardStats())
            )
            .subscribe({
                next: (data) => {
                    this.stats = data;
                    this.loading = false;
                    this.error = null;
                },
                error: (err) => {
                    console.error('Dashboard Stats Error:', err);
                    // Don't show error on subsequent polls if it was working
                    if (!this.stats) {
                        this.error = 'Failed to load dashboard data';
                    }
                    this.loading = false;
                }
            });
    }

    ngOnDestroy(): void {
        if (this.updateSubscription) {
            this.updateSubscription.unsubscribe();
        }
    }

    loadSubscriptionStatus(): void {
        this.ownerService.getSubscriptionStatus().subscribe({
            next: (data) => this.subscription = data,
            error: (err) => console.error('Subscription Error:', err)
        });
    }

    refresh(): void {
        // Force refresh by unsubscribing and re-subscribing or just calling load
        this.loading = true;
        this.updateSubscription.unsubscribe();
        this.ngOnInit();
    }
}
