import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API = 'http://localhost:8000/api/account';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  // LOGIN
  login(data: any) {
    return this.http.post(`${this.API}/login/`, data);
  }

  // SIGNUP
  signup(data: any) {
    return this.http.post(`${this.API}/signup/`, data);
  }

  updateProfile(data: any) {
    return this.http.put(`${this.API}/profile/`, data);
  }

  // SAVE TOKEN
  saveToken(res: any) {
    localStorage.setItem('access', res.access);
    localStorage.setItem('refresh', res.refresh);
  }

  // GET TOKEN
  getToken() {
    return localStorage.getItem('access');
  }

  // LOGOUT
  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  // ROLE
  getRole() {
    const token = localStorage.getItem('access');
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  }

  getEmployeeRole() {
    const token = localStorage.getItem('access');
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.employee_role;
  }

  getCurrentUser() {
    const token = localStorage.getItem('access');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        username: payload.username,
        email: payload.email,
        role: payload.role,
        organisation_id: payload.organisation_id,
        org_name: payload.org_name,
        org_email: payload.org_email
      };
    } catch (e) {
      return null;
    }
  }

  isLoggedIn() {
    return !!this.getToken();
  }
}
