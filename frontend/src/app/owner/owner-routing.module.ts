import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OwnerDashboardComponent } from './owner-dashboard/owner-dashboard.component';
import { OwnerLayoutComponent } from './owner-layout/owner-layout.component';
import { OwnerEmployeesComponent } from './owner-employees/owner-employees.component';
import { OwnerProjectsComponent } from './owner-projects/owner-projects.component';
import { OwnerTasksComponent } from './owner-tasks/owner-tasks.component';
import { OwnerTaskTrackerComponent } from './owner-task-tracker/owner-task-tracker.component';
import { OwnerSubscriptionComponent } from './owner-subscription/owner-subscription.component';
import { OwnerSupportComponent } from './owner-support/owner-support.component';
import { ProjectDetailsComponent } from './owner-projects/project-details/project-details.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { PaymentCancelComponent } from './payment-cancel/payment-cancel.component';
import { OwnerCheckoutComponent } from './owner-checkout/owner-checkout.component';

const routes: Routes = [
    {
        path: '',
        component: OwnerLayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: OwnerDashboardComponent },
            { path: 'employees', component: OwnerEmployeesComponent },
            { path: 'projects', component: OwnerProjectsComponent },
            { path: 'projects/:id', component: ProjectDetailsComponent },
            { path: 'tasks', component: OwnerTasksComponent },
            { path: 'tracker', component: OwnerTaskTrackerComponent },
            { path: 'subscription', component: OwnerSubscriptionComponent },
            { path: 'checkout/:id', component: OwnerCheckoutComponent },
            { path: 'support', component: OwnerSupportComponent },
            { path: 'payment-success', component: PaymentSuccessComponent },
            { path: 'payment-cancel', component: PaymentCancelComponent },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OwnerRoutingModule { }
