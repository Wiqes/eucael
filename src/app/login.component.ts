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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, DialogModule, InputTextModule, ButtonModule, ToastModule, DividerModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService],
})
export class LoginComponent {
  username = '';
  password = '';
  regUsername = '';
  regPassword = '';
  showRegister = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService,
  ) {}

  login() {
    this.http
      .post<any>('https://alseids-be.onrender.com/auth/login', {
        username: this.username,
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Login Successful',
            detail: 'Welcome!',
          });
          setTimeout(() => this.router.navigate(['/home']), 800);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: err.error?.message || 'Login failed',
          });
        },
      });
  }

  register() {
    if (!this.regUsername.trim() || !this.regPassword.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Username and password are required.',
      });
      return;
    }
    this.http
      .post<any>('https://alseids-be.onrender.com/auth/register', {
        username: this.regUsername,
        password: this.regPassword,
      })
      .subscribe({
        next: () => {
          this.showRegister = false;
          this.regUsername = '';
          this.regPassword = '';
          this.messageService.add({
            severity: 'success',
            summary: 'Registration Successful',
            detail: 'Please login.',
          });
        },
        error: (err) => {
          let detail = err.error?.message || 'Registration failed';
          if (typeof detail !== 'string') detail = 'Registration failed';
          this.messageService.add({
            severity: 'error',
            summary: 'Registration Failed',
            detail,
          });
        },
      });
  }

  showSuccess() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'This is a success toast!',
    });
  }

  showError() {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'This is an error toast!',
    });
  }

  showInfo() {
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'This is an info toast!',
    });
  }
}
