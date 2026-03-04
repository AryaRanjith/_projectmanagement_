import { Injectapi, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private apiUrl = `${environment.apiUrl}/ml`;

  constructor(private http: HttpClient) { }

  suggestTasks(projectName: string, projectDescription: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/suggest-tasks/`, {
      name: projectName,
      description: projectDescription
    });
  }

  refineDescription(taskTitle: string, context: string = ''): Observable<{description: string}> {
    return this.http.post<{description: string}>(`${this.apiUrl}/refine-description/`, {
      title: taskTitle,
      context: context
    });
  }

  getProjectAnalysis(projectId: number): Observable<{analysis: string}> {
    return this.http.get<{analysis: string}>(`${this.apiUrl}/project-analysis/${projectId}/`);
  }
}
