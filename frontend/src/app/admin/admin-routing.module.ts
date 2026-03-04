import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from '../shared/admin-dashboard/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminSupportComponent } from './admin-support/admin-support.component';
import { AdminAuditComponent } from './admin-audit/admin-audit.component';
import { AdminOrganisationComponent } from './admin-organisation/admin-organisation.component';
import { AdminPlansComponent } from './admin-plans/admin-plans.component';
import { AdminProfileComponent } from './admin-profile/admin-profile.component';
import { AdminAnalyticsComponent } from './admin-analytics/admin-analytics.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'support', component: AdminSupportComponent },
      { path: 'audit-logs', component: AdminAuditComponent },
      { path: 'organisations', component: AdminOrganisationComponent },
      { path: 'plans', component: AdminPlansComponent },
      { path: 'profile', component: AdminProfileComponent },
      { path: 'analytics', component: AdminAnalyticsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
