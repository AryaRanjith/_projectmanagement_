import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';

@Component({
    selector: 'app-admin-analytics',
    templateUrl: './admin-analytics.component.html',
    styleUrls: ['./admin-analytics.component.css']
})
export class AdminAnalyticsComponent implements OnInit {
    analytics: any = null;
    loading = true;

    constructor(private adminService: AdminService) { }

    ngOnInit(): void {
        this.fetchAnalytics();
    }

    fetchAnalytics(): void {
        this.loading = true;
        this.adminService.getPlatformAnalytics().subscribe({
            next: (data) => {
                this.analytics = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error fetching analytics:', err);
                this.loading = false;
            }
        });
    }

    getMax(data: number[]): number {
        return Math.max(...data, 1);
    }

    getBarHeight(value: number, max: number): string {
        const percentage = (value / max) * 100;
        return `${Math.max(percentage, 5)}%`;
    }
}
