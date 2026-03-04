import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OwnerService } from '../services/owner.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-owner-sidebar',
    templateUrl: './owner-sidebar.component.html',
    styleUrls: ['./owner-sidebar.component.css']
})
export class OwnerSidebarComponent implements OnInit {
    orgName = 'Organisation';
    isCollapsed = false;
    projects: any[] = [];
    expandedProjects: { [id: number]: boolean } = {};

    constructor(
        public router: Router,
        private ownerService: OwnerService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        const user = this.authService.getCurrentUser();
        if (user && user.org_name) {
            this.orgName = user.org_name;
        } else {
            // Fallback: fetch from API
            this.ownerService.getSubscriptionStatus().subscribe({
                next: (res) => {
                    if (res && res.org_name) {
                        this.orgName = res.org_name;
                    }
                }
            });
        }
        this.loadSidebarData();
    }

    loadSidebarData() {
        this.ownerService.getDashboardStats().subscribe(stats => {
            if (stats.project_overview) {
                this.projects = stats.project_overview;
            }
        });
    }

    toggleProject(projectId: number, event: Event) {
        event.stopPropagation();
        this.expandedProjects[projectId] = !this.expandedProjects[projectId];
    }

    isProjectExpanded(projectId: number): boolean {
        return !!this.expandedProjects[projectId];
    }

    handleLogoError(event: any): void {
        const char = this.orgName ? this.orgName.charAt(0) : 'O';
        event.target.src = `https://placehold.co/40x40/6366f1/white?text=${char}`;
    }

}
