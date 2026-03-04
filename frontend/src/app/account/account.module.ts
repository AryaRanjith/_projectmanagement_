import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AccountRoutingModule } from './account-routing.module';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AcceptInviteComponent } from './accept-invite/accept-invite.component';
import { SharedModule } from '../shared/shared.module';
import { LoginComponent } from './login/login.component';


@NgModule({
  declarations: [
    SignupComponent,
    ForgotPasswordComponent,
    AcceptInviteComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AccountRoutingModule,
    SharedModule,
    LoginComponent
  ]
})
export class AccountModule { }
