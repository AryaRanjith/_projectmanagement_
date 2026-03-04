import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
    @Input() title: string = 'Admin Panel';
    @Input() menuItems: any[] = [];
    @Input() isCollapsed = false;

    // Default items removed, now passed via Input


    constructor(
        public router: Router,
        private authService: AuthService
    ) { }

    toggleSidebar() {
        this.isCollapsed = !this.isCollapsed;
    }
}
