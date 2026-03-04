import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';

@Component({
    selector: 'app-admin-audit',
    templateUrl: './admin-audit.component.html',
    styleUrls: ['./admin-audit.component.css']
})
export class AdminAuditComponent implements OnInit {
    logs: any[] = [];
    loading = true;

    constructor(private adminService: AdminService) { }

    ngOnInit(): void {
        this.adminService.getAuditLogs().subscribe({
            next: (data) => {
                this.logs = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error fetching logs:', err);
                this.loading = false;
            }
        });
    }
}
