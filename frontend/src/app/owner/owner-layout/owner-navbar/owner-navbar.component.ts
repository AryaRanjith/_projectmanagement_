import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OwnerService } from '../../services/owner.service';

@Component({
    selector: 'app-owner-navbar',
    templateUrl: './owner-navbar.component.html',
    styleUrls: ['./owner-navbar.component.css']
})
export class OwnerNavbarComponent implements OnInit {
    @Output() toggleSidebar = new EventEmitter<void>();

    showProfileDropdown = false;
    showNotifications = false;
    companyName = '';
    companyEmail = '';
    notifications: any[] = [];
    searchQuery = '';

    onGlobalSearch(): void {
        const query = this.searchQuery.trim();
        // Navigate to projects with search query
        this.router.navigate(['/owner/projects'], { queryParams: { search: query } });
    }

    constructor(
        private router: Router,
        private authService: AuthService,
        private ownerService: OwnerService
    ) { }

    ngOnInit(): void {
        const user = this.authService.getCurrentUser();
        if (user) {
            this.companyName = user.org_name || 'Organisation';
            this.companyEmail = user.org_email || user.email;

            if (!user.org_name) {
                this.ownerService.getSubscriptionStatus().subscribe({
                    next: (res) => {
                        if (res && res.org_name) {
                            this.companyName = res.org_name;
                        }
                    }
                });
            }
        }
        this.fetchNotifications();
    }

    fetchNotifications(): void {
        this.ownerService.getNotifications().subscribe({
            next: (data) => this.notifications = data,
            error: (err) => console.error('Notifications Error:', err)
        });
    }

    getUnreadCount(): number {
        return this.notifications.filter(n => !n.is_read).length;
    }

    markAsRead(notif: any): void {
        if (!notif.is_read) {
            this.ownerService.markNotificationAsRead(notif.id).subscribe({
                next: () => notif.is_read = true
            });
        }
    }

    onToggleSidebar(): void {
        this.toggleSidebar.emit();
    }

    toggleProfile(): void {
        this.showProfileDropdown = !this.showProfileDropdown;
        if (this.showProfileDropdown) this.showNotifications = false;
    }

    toggleNotificationsPanel(): void {
        this.showNotifications = !this.showNotifications;
        if (this.showNotifications) {
            this.showProfileDropdown = false;
            // Mark all as read when opening
            this.ownerService.markAllNotificationsAsRead().subscribe({
                next: () => {
                    this.notifications.forEach(n => n.is_read = true);
                }
            });
        }
    }

    logout(): void {
        this.authService.logout();
    }

    navigateToProfile(): void {
        // this.router.navigate(['/owner/profile']);
        this.showProfileDropdown = false;
    }
}
