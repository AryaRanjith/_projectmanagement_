import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-accept-invite',
    templateUrl: './accept-invite.component.html',
    styleUrls: ['./accept-invite.component.css']
})
export class AcceptInviteComponent implements OnInit {
    token: string | null = null;
    loading = true;
    error = '';
    invitation: any = null;

    password = '';
    confirmPassword = '';
    submitting = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.token = this.route.snapshot.paramMap.get('token');
        if (!this.token) {
            this.error = 'Invalid invitation link';
            this.loading = false;
            return;
        }
        this.verifyInvite();
    }

    verifyInvite(): void {
        this.loading = true;
        this.http.get(`${environment.apiUrl}/account/verify-invite/${this.token}/`).subscribe({
            next: (data) => {
                this.invitation = data;
                this.loading = false;
            },
            error: (err) => {
                this.error = err.error?.error || 'Invitation not found or expired';
                this.loading = false;
            }
        });
    }

    onSubmit(): void {
        if (!this.password || this.password !== this.confirmPassword) {
            this.error = 'Passwords do not match';
            return;
        }

        if (this.password.length < 8) {
            this.error = 'Password must be at least 8 characters long';
            return;
        }

        this.submitting = true;
        this.error = '';

        this.http.post(`${environment.apiUrl}/account/accept-invite/${this.token}/`, {
            password: this.password
        }).subscribe({
            next: (res: any) => {
                // Auto-login
                this.authService.saveToken(res);
                this.router.navigate(['/employee/dashboard']);
            },
            error: (err) => {
                this.error = err.error?.error || 'Failed to accept invitation';
                this.submitting = false;
            }
        });
    }
}
