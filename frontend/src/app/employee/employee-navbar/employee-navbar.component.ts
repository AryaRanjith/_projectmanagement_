import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-employee-navbar',
    templateUrl: './employee-navbar.component.html',
    styleUrls: ['./employee-navbar.component.css']
})
export class EmployeeNavbarComponent {
    @Output() toggleSidebar = new EventEmitter<void>();
    currentUser: any;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {
        this.currentUser = this.authService.getCurrentUser();
    }

    logout(): void {
        this.authService.logout();
    }
}
