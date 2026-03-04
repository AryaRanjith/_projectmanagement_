import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { OwnerRoutingModule } from './owner-routing.module';
import { SharedModule } from '../shared/shared.module';
import { OwnerService } from './services/owner.service';

import { OwnerDashboardComponent } from './owner-dashboard/owner-dashboard.component';
import { OwnerLayoutComponent } from './owner-layout/owner-layout.component';
import { OwnerEmployeesComponent } from './owner-employees/owner-employees.component';
import { OwnerProjectsComponent } from './owner-projects/owner-projects.component';
import { OwnerTasksComponent } from './owner-tasks/owner-tasks.component';
import { OwnerTaskTrackerComponent } from './owner-task-tracker/owner-task-tracker.component';
import { OwnerSupportComponent } from './owner-support/owner-support.component';
import { OwnerSubscriptionComponent } from './owner-subscription/owner-subscription.component';
import { OwnerSidebarComponent } from './owner-sidebar/owner-sidebar.component';
import { ProjectDetailsComponent } from './owner-projects/project-details/project-details.component';

import { OwnerNavbarComponent } from './owner-layout/owner-navbar/owner-navbar.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { PaymentCancelComponent } from './payment-cancel/payment-cancel.component';
import { OwnerCheckoutComponent } from './owner-checkout/owner-checkout.component';

@NgModule({
    declarations: [
        OwnerDashboardComponent,
        OwnerLayoutComponent,
        OwnerNavbarComponent,
        OwnerEmployeesComponent,
        OwnerProjectsComponent,
        OwnerTasksComponent,
        OwnerSubscriptionComponent,
        OwnerSidebarComponent,
        ProjectDetailsComponent,
        OwnerTaskTrackerComponent,
        OwnerSupportComponent,
        PaymentSuccessComponent,
        PaymentCancelComponent,
        OwnerCheckoutComponent
    ],
    imports: [
        CommonModule,
        OwnerRoutingModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule
    ],
    providers: [
        OwnerService
    ]
})
export class OwnerModule { }
