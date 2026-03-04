import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private API_URL = 'http://localhost:8000/api';

    constructor(private http: HttpClient) { }

    // Support Tickets
    getAllTickets(): Observable<any[]> {
        return this.http.get<any[]>(`${this.API_URL}/support/admin/all/`);
    }

    replyTicket(ticketId: number, message: string): Observable<any> {
        return this.http.post(`${this.API_URL}/support/admin/reply/${ticketId}/`, { message });
    }

    closeTicket(ticketId: number): Observable<any> {
        return this.http.post(`${this.API_URL}/support/admin/close/${ticketId}/`, {});
    }

    // Audit Logs
    getAuditLogs(): Observable<any[]> {
        return this.http.get<any[]>(`${this.API_URL}/audit/platform/`);
    }

    // Organisations
    getAllOrganisations(search?: string): Observable<any[]> {
        const params: any = {};
        if (search) params.search = search;
        return this.http.get<any[]>(`${this.API_URL}/organisations/admin/all/`, { params });
    }

    activateOrganisation(orgId: number): Observable<any> {
        return this.http.post(`${this.API_URL}/organisations/admin/activate/${orgId}/`, {});
    }

    suspendOrganisation(orgId: number): Observable<any> {
        return this.http.post(`${this.API_URL}/organisations/admin/suspend/${orgId}/`, {});
    }

    toggleSubscription(subId: number): Observable<any> {
        return this.http.post(`${this.API_URL}/billing/admin/toggle-subscription/${subId}/`, {});
    }

    createOrganisation(data: any): Observable<any> {
        return this.http.post(`${this.API_URL}/organisations/admin/create/`, data);
    }

    updateOrganisation(orgId: number, data: any): Observable<any> {
        return this.http.put(`${this.API_URL}/organisations/admin/edit/${orgId}/`, data);
    }

    deleteOrganisation(orgId: number): Observable<any> {
        return this.http.delete(`${this.API_URL}/organisations/admin/delete/${orgId}/`);
    }

    // Plans
    getAllPlans(): Observable<any[]> {
        return this.http.get<any[]>(`${this.API_URL}/billing/admin/plans/all/`);
    }

    createPlan(data: any): Observable<any> {
        return this.http.post(`${this.API_URL}/billing/admin/plans/create/`, data);
    }

    updatePlan(planId: number, data: any): Observable<any> {
        return this.http.put(`${this.API_URL}/billing/admin/plans/edit/${planId}/`, data);
    }

    deletePlan(planId: number): Observable<any> {
        return this.http.delete(`${this.API_URL}/billing/admin/plans/delete/${planId}/`);
    }

    // Analytics
    getPlatformAnalytics(): Observable<any> {
        return this.http.get<any>(`${this.API_URL}/analytics/platform/`);
    }
}
