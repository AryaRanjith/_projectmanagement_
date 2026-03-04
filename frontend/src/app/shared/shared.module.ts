import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AdminNavbarComponent } from './admin-dashboard/admin-navbar/admin-navbar.component';
import { AdminSidebarComponent } from './admin-dashboard/admin-sidebar/admin-sidebar.component';
import { AdminLayoutComponent } from './admin-dashboard/admin-layout/admin-layout.component';


import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    NavbarComponent,
    SidebarComponent,
    AdminNavbarComponent,
    AdminSidebarComponent,
    AdminLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  exports: [
    NavbarComponent,
    SidebarComponent,
    RouterModule,
    AdminNavbarComponent,
    AdminSidebarComponent,
    AdminLayoutComponent,
    FormsModule
  ]

})
export class SharedModule { }
