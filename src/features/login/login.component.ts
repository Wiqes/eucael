import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { environment } from '../../environments/environment';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    DividerModule,
    NgIf,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService],
})
export class LoginComponent {
  username = '';
  password = '';
  regUsername = '';
  regPassword = '';
  regOtp = '';
  showRegister = false;
  loadingLogin = false;
  otpRequested = false;
  emailSent = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService,
  ) {}

  login() {
    this.loadingLogin = true;
    this.http
      .post<any>('https://alseids-be.onrender.com/auth/login', {
        username: this.username,
        password: this.password,
      })
      .subscribe({
        next: (res) => {
          // Try to save token in a more robust way
          try {
            if (res && res.access_token) {
              window.localStorage.setItem('token', res.access_token);
            }
          } catch (e) {
            this.messageService.add({
              severity: 'error',
              summary: 'Storage Error',
              detail: 'Unable to save token. Please check your browser settings.',
              life: 4000,
            });
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Login Successful',
            detail: 'Welcome!',
            life: 4000,
          });
          setTimeout(() => {
            this.router.navigate(['/home']);
            this.loadingLogin = false;
          }, 800);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: err.error?.message || 'Login failed',
            life: 4000,
          });
          this.loadingLogin = false;
        },
      });
  }

  register() {
    if (!this.otpRequested) {
      // Step 1: Validate email and password, then request OTP
      if (!this.regUsername.trim() || !this.regPassword.trim()) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Validation',
          detail: 'Email and password are required.',
          life: 4000,
        });
        return;
      }
      // Save email for OTP step
      this.loadingLogin = true;
      this.emailSent = this.regUsername.trim();
      this.http
        .post<any>('https://alseids-be.onrender.com/auth/request-otp', {
          username: this.emailSent,
        })
        .subscribe({
          next: () => {
            this.otpRequested = true;
            this.messageService.add({
              severity: 'success',
              summary: 'OTP Sent',
              detail: 'An OTP has been sent to your email.',
              life: 4000,
            });
            this.loadingLogin = false;
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'OTP Request Failed',
              detail: err.error?.message || 'Failed to send OTP.',
              life: 4000,
            });
            this.loadingLogin = false;
          },
        });
      return;
    }
    // Step 2: Register with OTP
    if (!this.regOtp.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'OTP is required.',
        life: 4000,
      });
      return;
    }
    this.loadingLogin = true;
    this.http
      .post<any>('https://alseids-be.onrender.com/auth/register', {
        username: this.emailSent,
        password: this.regPassword,
        otp: this.regOtp,
      })
      .subscribe({
        next: () => {
          this.showRegister = false;
          this.regUsername = '';
          this.regPassword = '';
          this.regOtp = '';
          this.otpRequested = false;
          this.emailSent = '';
          this.messageService.add({
            severity: 'success',
            summary: 'Registration Successful',
            detail: 'Please login.',
            life: 4000,
          });
          this.loadingLogin = false;
        },
        error: (err) => {
          let detail = err.error?.message || 'Registration failed';
          if (typeof detail !== 'string') detail = 'Registration failed';
          this.messageService.add({
            severity: 'error',
            summary: 'Registration Failed',
            detail,
            life: 4000,
          });
          this.loadingLogin = false;
        },
      });
  }

  googleLogin() {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${environment.API_URL}/auth/google`;
  }

  showSuccess() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'This is a success toast!',
      life: 4000,
    });
  }

  showError() {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'This is an error toast!',
      life: 4000,
    });
  }

  showInfo() {
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'This is an info toast!',
      life: 4000,
    });
  }
}
