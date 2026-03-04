import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'account',
    loadChildren: () => import('./account/account.module').then(m => m.AccountModule)
  },
  {
    path: 'pricing',
    loadChildren: () => import('./payments/payments.module').then(m => m.PaymentsModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'owner',
    loadChildren: () =>
      import('./owner/owner.module').then(m => m.OwnerModule),
    canActivate: [authGuard]
  },
  {
    path: 'employee',
    loadChildren: () =>
      import('./employee/employee.module').then(m => m.EmployeeModule),
    canActivate: [authGuard]
  },
  { path: '', redirectTo: 'account/signup', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
