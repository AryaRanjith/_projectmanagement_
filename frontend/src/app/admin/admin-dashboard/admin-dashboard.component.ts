import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats: any = null;
  loading = true;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.fetchAnalytics();
  }

  fetchAnalytics(): void {
    this.loading = true;
    this.adminService.getPlatformAnalytics().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching analytics:', err);
        this.loading = false;
      }
    });
  }
}
