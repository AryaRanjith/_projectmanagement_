import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  error: string = '';
  isSuccess: boolean = false;
  isLoading: boolean = false;

  constructor(private router: Router) { }

  sendResetLink() {
    if (!this.email) {
      this.error = 'Please enter your email address';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.isSuccess = false;

    // Logic for forgot password
    setTimeout(() => {
      this.isSuccess = true;
      this.isLoading = false;
    }, 1500);
  }
}
