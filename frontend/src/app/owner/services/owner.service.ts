import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class OwnerService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // ==================
    // DASHBOARD
    // ==================
    getDashboardStats(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/organisations/owner/dashboard/`);
    }

    getOrganisation(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/organisations/owner/status/`); // Wait, need to check backend URL
    }

    // ==================
    // SUBSCRIPTION
    // ==================
    getSubscriptionStatus(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/organisations/owner/subscription/`);
    }

    // ==================
    // EMPLOYEES
    // ==================
    getEmployees(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/organisations/owner/employees/`);
    }

    inviteEmployee(email: string, employeeRole: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/organisations/owner/employees/invite/`, {
            email,
            employee_role: employeeRole
        });
    }

    toggleEmployee(employeeId: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/organisations/owner/employees/toggle/${employeeId}/`, {});
    }

    cancelInvitation(invitationId: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/organisations/owner/employees/invitations/${invitationId}/`);
    }

    // ==================
    // PROJECTS
    // PROJECTS
    // ==================
    getProjects(search?: string): Observable<any[]> {
        const params = search ? `?search=${search}` : '';
        return this.http.get<any[]>(`${this.apiUrl}/projects/owner/projects/${params}`);
    }

    getProject(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/projects/owner/projects/${id}/`);
    }

    createProject(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/projects/owner/projects/`, data);
    }

    updateProject(id: number, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/projects/owner/projects/${id}/`, data);
    }

    deleteProject(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/projects/owner/projects/${id}/`);
    }

    // ==================
    // TASKS
    // ==================
    getTasks(filters?: { project?: number; status?: string; assignee?: number; search?: string }): Observable<any[]> {
        let params = '';
        if (filters) {
            const queryParams = [];
            if (filters.project) queryParams.push(`project=${filters.project}`);
            if (filters.status) queryParams.push(`status=${filters.status}`);
            if (filters.assignee) queryParams.push(`assignee=${filters.assignee}`);
            if (filters.search) queryParams.push(`search=${filters.search}`);
            if (queryParams.length) params = '?' + queryParams.join('&');
        }
        return this.http.get<any[]>(`${this.apiUrl}/projects/owner/tasks/${params}`);
    }

    getTask(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/projects/owner/tasks/${id}/`);
    }

    createTask(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/projects/owner/tasks/`, data);
    }

    updateTask(id: number, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/projects/owner/tasks/${id}/`, data);
    }

    deleteTask(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/projects/owner/tasks/${id}/`);
    }

    updateTaskProgress(id: number, progress: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/projects/owner/tasks/${id}/update_progress/`, { progress });
    }

    assignTask(id: number, assigneeId: number | null): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/projects/owner/tasks/${id}/assign/`, { assignee_id: assigneeId });
    }

    // ==================
    // MILESTONES
    // ==================
    getMilestones(projectId?: number): Observable<any[]> {
        const params = projectId ? `?project=${projectId}` : '';
        return this.http.get<any[]>(`${this.apiUrl}/projects/owner/milestones/${params}`);
    }

    createMilestone(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/projects/owner/milestones/`, data);
    }

    completeMilestone(id: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/projects/owner/milestones/${id}/complete/`, {});
    }

    // ==================
    // TIME ENTRIES
    // ==================
    getTimeEntries(filters?: { task?: number; user?: number }): Observable<any[]> {
        let params = '';
        if (filters) {
            const queryParams = [];
            if (filters.task) queryParams.push(`task=${filters.task}`);
            if (filters.user) queryParams.push(`user=${filters.user}`);
            if (queryParams.length) params = '?' + queryParams.join('&');
        }
        return this.http.get<any[]>(`${this.apiUrl}/projects/owner/time-entries/${params}`);
    }

    logTime(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/projects/owner/time-entries/`, data);
    }

    // ==================
    // DOCUMENTS
    // ==================
    getDocuments(projectId?: number): Observable<any[]> {
        const params = projectId ? `?project=${projectId}` : '';
        return this.http.get<any[]>(`${this.apiUrl}/projects/owner/documents/${params}`);
    }

    uploadDocument(data: FormData): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/projects/owner/documents/`, data);
    }

    deleteDocument(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/projects/owner/documents/${id}/`);
    }

    // ==================
    // SUPPORT
    // ==================
    getMyTickets(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/support/my/`);
    }

    createTicket(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/support/create/`, data);
    }

    // ==================
    // NOTIFICATIONS
    // ==================
    getNotifications(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/account/notifications/`);
    }

    markNotificationAsRead(id: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/account/notifications/read/${id}/`, {});
    }

    markAllNotificationsAsRead(): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/account/notifications/read-all/`, {});
    }
}
