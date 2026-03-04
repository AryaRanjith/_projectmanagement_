import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-owner-layout',
    templateUrl: './owner-layout.component.html',
    styleUrls: ['./owner-layout.component.css']
})
export class OwnerLayoutComponent implements OnInit {

    menuItems: any[] = [];
    isCollapsed = false;

    allMenuItems = [
        {
            label: 'Dashboard',
            icon: '📊',
            route: '/owner/dashboard',
            roles: ['OWNER', 'PROJECT_LEAD', 'TEAM_LEAD']
        },
        {
            label: 'Employees',
            icon: '👥',
            route: '/owner/employees',
            roles: ['OWNER'] // Only owner manages employees for now
        },
        {
            label: 'Projects',
            icon: '📁',
            route: '/owner/projects',
            roles: ['OWNER', 'PROJECT_LEAD', 'TEAM_LEAD']
        },
        {
            label: 'Tasks',
            icon: '✓',
            route: '/owner/tasks',
            roles: ['OWNER', 'PROJECT_LEAD', 'TEAM_LEAD']
        },
        {
            label: 'Subscription',
            icon: '💎',
            route: '/owner/subscription',
            roles: ['OWNER']
        }
    ];

    constructor(private authService: AuthService) { }

    ngOnInit() {
        this.filterMenu();
    }

    filterMenu() {
        const role = this.authService.getRole();
        const employeeRole = this.authService.getEmployeeRole();

        console.log('Current Role:', role, 'Employee Role:', employeeRole);

        this.menuItems = this.allMenuItems.filter(item => {
            if (role === 'OWNER') return true;
            if (role === 'EMPLOYEE' && employeeRole) {
                return item.roles.includes(employeeRole);
            }
            return false;
        });
    }

    get ownerMenuItems() {
        return this.menuItems;
    }

    toggleSidebar() {
        this.isCollapsed = !this.isCollapsed;
    }
}
