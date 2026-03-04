import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-admin-profile',
    templateUrl: './admin-profile.component.html',
    styleUrls: ['./admin-profile.component.css']
})
export class AdminProfileComponent implements OnInit {
    user: any = null;
    profileData = {
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    };

    successMessage = '';
    errorMessage = '';
    loading = false;

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.user = this.authService.getCurrentUser();
        if (this.user) {
            this.profileData.email = this.user.email;
            this.profileData.username = this.user.username;
        }
    }

    onSubmit(): void {
        if (this.profileData.password && this.profileData.password !== this.profileData.confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        this.loading = true;
        const updatePayload: any = {
            email: this.profileData.email,
            username: this.profileData.username
        };

        if (this.profileData.password) {
            updatePayload.password = this.profileData.password;
        }

        this.authService.updateProfile(updatePayload).subscribe({
            next: (res: any) => {
                this.showSuccess('Profile updated successfully. Please log in again if you changed your credentials.');
                this.loading = false;
                if (this.profileData.password || this.profileData.email !== this.user.email) {
                    // Optional: auto logout if sensitive info changed
                    // this.authService.logout();
                }
            },
            error: (err) => {
                this.showError(err.error?.error || 'Failed to update profile');
                this.loading = false;
            }
        });
    }

    private showSuccess(msg: string): void {
        this.successMessage = msg;
        setTimeout(() => this.successMessage = '', 5000);
    }

    private showError(msg: string): void {
        this.errorMessage = msg;
        setTimeout(() => this.errorMessage = '', 5000);
    }
}
