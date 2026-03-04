import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
import { EmployeeLayoutComponent } from './employee-layout/employee-layout.component';
import { EmployeeNavbarComponent } from './employee-navbar/employee-navbar.component';

import { EmployeeSidebarComponent } from './employee-sidebar/employee-sidebar.component';

const routes: Routes = [
    {
        path: '',
        component: EmployeeLayoutComponent,
        children: [
            { path: 'dashboard', component: EmployeeDashboardComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    }
];

@NgModule({
    declarations: [
        EmployeeDashboardComponent,
        EmployeeLayoutComponent,
        EmployeeNavbarComponent,
        EmployeeSidebarComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        RouterModule.forChild(routes)
    ]
})
export class EmployeeModule { }
