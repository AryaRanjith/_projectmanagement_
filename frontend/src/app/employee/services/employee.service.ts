import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class EmployeeService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getMyDashboard(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/organisations/employee/dashboard/`);
    }

    getMyTasks(filters: any = {}): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/projects/employee/tasks/`, { params: filters });
    }

    updateTaskProgress(taskId: number, progress: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/projects/employee/tasks/${taskId}/update_progress/`, { progress });
    }

    updateTaskStatus(taskId: number, status: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/projects/employee/tasks/${taskId}/update-status/`, { status });
    }
}
