import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/billing`;

  constructor(private http: HttpClient) { }

  getPlans(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/plans/`);
  }

  createCheckoutSession(planId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/checkout/`, { plan_id: planId });
  }

  simulateSuccess(planId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/simulate-success/`, { plan_id: planId });
  }
}
