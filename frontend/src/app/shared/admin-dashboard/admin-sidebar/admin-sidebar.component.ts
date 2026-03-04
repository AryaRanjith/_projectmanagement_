import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

interface MenuItem {
    icon: string;
    label: string;
    route: string;
    children?: MenuItem[];
}

interface Company {
    id: number;
    name: string;
    status: 'active' | 'suspended' | 'disabled';
    plan: string;
}

@Component({
    selector: 'app-admin-sidebar',
    templateUrl: './admin-sidebar.component.html',
    styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent {
    @Input() isCollapsed = false;
    @Output() collapseChange = new EventEmitter<boolean>();

    showCompanyDropdown = false;
    expandedMenus: Set<string> = new Set();

    // Mock current company for demo
    currentCompany: Company = {
        id: 1,
        name: 'Acme Corporation',
        status: 'active',
        plan: 'Enterprise'
    };

    // Recent companies for quick access
    recentCompanies: Company[] = [
        { id: 1, name: 'Acme Corporation', status: 'active', plan: 'Enterprise' },
        { id: 2, name: 'Tech Innovations', status: 'active', plan: 'Business' },
        { id: 3, name: 'StartUp Inc', status: 'suspended', plan: 'Starter' }
    ];

    menuItems: MenuItem[] = [
        { icon: 'fa-tachometer-alt', label: 'Dashboard', route: '/admin/dashboard' },
        {
            icon: 'fa-building',
            label: 'Organisations',
            route: '/admin/organisations'
        },
        {
            icon: 'fa-credit-card',
            label: 'Subscription Plans',
            route: '/admin/plans'
        },
        { icon: 'fa-chart-line', label: 'Analytics', route: '/admin/analytics' },
        { icon: 'fa-headset', label: 'Support Tickets', route: '/admin/support' },
        { icon: 'fa-clipboard-list', label: 'Audit Logs', route: '/admin/audit-logs' }
    ];

    constructor(public router: Router) { }

    toggleCollapse(): void {
        this.isCollapsed = !this.isCollapsed;
        this.collapseChange.emit(this.isCollapsed);
    }

    toggleCompanyDropdown(): void {
        this.showCompanyDropdown = !this.showCompanyDropdown;
    }

    selectCompany(company: Company): void {
        this.currentCompany = company;
        this.showCompanyDropdown = false;
    }

    toggleSubmenu(label: string): void {
        if (this.expandedMenus.has(label)) {
            this.expandedMenus.delete(label);
        } else {
            this.expandedMenus.add(label);
        }
    }

    isExpanded(label: string): boolean {
        return this.expandedMenus.has(label);
    }

    navigateTo(route: string): void {
        this.router.navigate([route]);
    }

    getStatusClass(status: string): string {
        const statusMap: { [key: string]: string } = {
            'active': 'status-active',
            'suspended': 'status-suspended',
            'disabled': 'status-disabled'
        };
        return statusMap[status] || '';
    }

    editCompany(): void {
        this.showCompanyDropdown = false;
        this.router.navigate(['/admin/companies', this.currentCompany.id, 'edit']);
    }

    deleteCompany(): void {
        this.showCompanyDropdown = false;
        // This would trigger a confirmation modal in real implementation
        console.log('Delete company:', this.currentCompany.id);
    }
}
