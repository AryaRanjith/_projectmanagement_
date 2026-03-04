import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-employee-layout',
    templateUrl: './employee-layout.component.html',
    styleUrls: ['./employee-layout.component.css']
})
export class EmployeeLayoutComponent implements OnInit {
    isCollapsed = false;
    menuItems = [
        {
            label: 'Dashboard',
            icon: '📊',
            route: '/employee/dashboard'
        }
    ];

    constructor(private authService: AuthService) { }

    ngOnInit(): void { }

    toggleSidebar(): void {
        this.isCollapsed = !this.isCollapsed;
    }
}
