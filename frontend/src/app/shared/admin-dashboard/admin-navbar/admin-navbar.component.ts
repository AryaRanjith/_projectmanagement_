import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-admin-navbar',
    templateUrl: './admin-navbar.component.html',
    styleUrls: ['./admin-navbar.component.css']
})
export class AdminNavbarComponent {
    @Output() toggleSidebar = new EventEmitter<void>();

    showProfileDropdown = false;
    showNotifications = false;
    searchQuery = '';

    onGlobalSearch(): void {
        const query = this.searchQuery.trim();
        // Search companies by default if we are on global search
        this.router.navigate(['/admin/organisations'], { queryParams: { search: query } });
    }

    notifications: any[] = [];

    recentActivity: any[] = [];

    constructor(
        private router: Router,
        public authService: AuthService
    ) { }

    onToggleSidebar(): void {
        this.toggleSidebar.emit();
    }

    toggleProfile(): void {
        this.showProfileDropdown = !this.showProfileDropdown;
        this.showNotifications = false;
    }

    toggleNotificationsPanel(): void {
        this.showNotifications = !this.showNotifications;
        this.showProfileDropdown = false;

        if (this.showNotifications) {
            // Mark all as read when opening the panel
            this.notifications.forEach(n => n.unread = false);
        }
    }

    getUnreadCount(): number {
        return this.notifications.filter(n => n.unread).length;
    }

    markAsRead(notification: any): void {
        notification.unread = false;
    }

    getAdminName(): string {
        const token = this.authService.getToken();
        if (!token) return 'Admin';

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub || payload.username || 'Admin';
        } catch {
            return 'Admin';
        }
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/account/login']);
    }

    navigateToProfile(): void {
        this.showProfileDropdown = false;
        this.router.navigate(['/admin/profile']);
    }

    navigateToSettings(): void {
        this.showProfileDropdown = false;
        this.router.navigate(['/admin/settings']);
    }
}
