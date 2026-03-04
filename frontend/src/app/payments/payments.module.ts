import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentsRoutingModule } from './payments-routing.module';
import { SubscriptionComponent } from './subscription/subscription.component';


import { SharedModule } from '../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    SubscriptionComponent
  ],
  imports: [
    CommonModule,
    PaymentsRoutingModule,
    SharedModule,
    HttpClientModule
  ]
})
export class PaymentsModule { }
