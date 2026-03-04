import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { AdminSupportComponent } from './admin-support/admin-support.component';
import { AdminAuditComponent } from './admin-audit/admin-audit.component';
import { AdminOrganisationComponent } from './admin-organisation/admin-organisation.component';
import { AdminPlansComponent } from './admin-plans/admin-plans.component';
import { AdminProfileComponent } from './admin-profile/admin-profile.component';
import { AdminAnalyticsComponent } from './admin-analytics/admin-analytics.component';
import { AdminService } from './services/admin.service';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    AdminSupportComponent,
    AdminAuditComponent,
    AdminOrganisationComponent,
    AdminPlansComponent,
    AdminProfileComponent,
    AdminAnalyticsComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    AdminService
  ]
})
export class AdminModule { }
