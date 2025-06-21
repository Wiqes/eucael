import { Component, inject, signal, effect } from '@angular/core';
import { FormBuilder, FormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { environment } from '../../../environments/environment';
import { ReactiveFormsModule } from '@angular/forms';
import { GoogleButtonComponent } from '../../shared/ui/google-button/google-button.component';
import { FormControlComponent } from '../../shared/ui/form-control/form-control.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    ReactiveFormsModule,
    DividerModule,
    GoogleButtonComponent,
    FormControlComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loadingLogin = false;
  loadingRegistration = false;
  otpRequested = signal(false);

  private http = inject(HttpClient);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private formBuilder = inject(FormBuilder);

  form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    otp: ['', [Validators.pattern(/^[0-9]{6}$/)]],
  });
  formControls = this.form.controls;

  constructor() {
    effect(() => {
      const required = this.otpRequested();
      const otpControl = this.formControls['otp'];
      if (required) {
        otpControl.addValidators(Validators.required);
      } else {
        otpControl.removeValidators(Validators.required);
        otpControl.setValue('');
        otpControl.markAsUntouched();
      }
      otpControl.updateValueAndValidity();
    });
  }

  login() {
    this.loadingLogin = true;
    this.http
      .post<any>(`${environment.API_URL}/auth/login`, {
        username: this.formControls['email'].value,
        password: this.formControls['password'].value,
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
            this.router.navigate(['/cases']);
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
    if (!this.otpRequested()) {
      // Save email for OTP step
      this.loadingRegistration = true;
      this.http
        .post<any>(`${environment.API_URL}/auth/request-otp`, {
          username: this.formControls['email'].value,
        })
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'OTP Sent',
              detail: 'An OTP has been sent to your email.',
              life: 4000,
            });
            this.loadingRegistration = false;
            this.otpRequested.set(true);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'OTP Request Failed',
              detail: err.error?.message || 'Failed to send OTP.',
              life: 4000,
            });
            this.loadingRegistration = false;
          },
        });
      return;
    }
    // Step 2: Register with OTP
    if (this.otpRequested() && !this.formControls['otp'].value) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'OTP is required.',
        life: 4000,
      });
      return;
    }
    this.loadingRegistration = true;
    this.http
      .post<any>(`${environment.API_URL}/auth/register`, {
        username: this.formControls['email'].value,
        password: this.formControls['password'].value,
        otp: this.formControls['otp'].value,
      })
      .subscribe({
        next: () => {
          this.otpRequested.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Registration Successful',
            detail: 'Please login.',
            life: 4000,
          });
          this.loadingRegistration = false;
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
          this.loadingRegistration = false;
        },
      });
  }

  googleLogin() {
    window.location.href = `${environment.API_URL}/auth/google`;
  }
}
