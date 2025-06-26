import { Component, inject, signal, effect } from '@angular/core';
import { FormBuilder, FormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { environment } from '../../../environments/environment';
import { ReactiveFormsModule } from '@angular/forms';
import { GoogleButtonComponent } from '../../shared/ui/google-button/google-button.component';
import { FormControlComponent } from '../../shared/ui/form-control/form-control.component';
import { MessageService } from '../../core/services/message.service';
import { MESSAGES } from '../../core/constants/messages';

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
  loadingResetPassword = false;
  otpRequested = signal(false);
  passwordConfirmationRequested = signal(false);

  private http = inject(HttpClient);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private formBuilder = inject(FormBuilder);

  form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    confirmPassword: [''],
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
            if (res?.access_token) {
              window.localStorage.setItem('token', res.access_token);
            }
          } catch (e) {
            this.messageService.sendMessage(MESSAGES.STORAGE_ERROR);
          }
          this.messageService.sendMessage(MESSAGES.LOGIN_SUCCESS);
          setTimeout(() => {
            this.router.navigate(['/cases']);
            this.loadingLogin = false;
          }, 800);
        },
        error: () => {
          this.messageService.sendMessage(MESSAGES.LOGIN_FAILED);
          this.loadingLogin = false;
        },
      });
  }

  requestOTP() {
    if (this.formControls['password'].value !== this.formControls['confirmPassword'].value) {
      this.messageService.sendMessage(MESSAGES.PASSWORD_MISMATCH);
      return;
    }
    this.loadingRegistration = true;
    this.http
      .post<any>(`${environment.API_URL}/auth/request-otp`, {
        username: this.formControls['email'].value,
      })
      .subscribe({
        next: () => {
          this.messageService.sendMessage(MESSAGES.OTP_SENT);
          this.loadingRegistration = false;
          this.otpRequested.set(true);
          this.passwordConfirmationRequested.set(false);
        },
        error: () => {
          this.messageService.sendMessage(MESSAGES.OTP_REQUEST_FAILED);
          this.loadingRegistration = false;
        },
      });
  }

  register() {
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
          this.messageService.sendMessage(MESSAGES.REGISTRATION_SUCCESS);
          this.loadingRegistration = false;
        },
        error: () => {
          this.messageService.sendMessage(MESSAGES.REGISTRATION_FAILED);
          this.loadingRegistration = false;
        },
      });
  }

  backToLogin() {
    this.otpRequested.set(false);
    this.passwordConfirmationRequested.set(false);
    this.formControls['otp'].setValue('');
    this.formControls['confirmPassword'].setValue('');
  }

  onForgotPassword() {
    if (this.formControls['email'].invalid) {
      this.messageService.sendMessage(MESSAGES.INVALID_EMAIL);
      return;
    }
    this.loadingResetPassword = true;
    this.http
      .post<any>(`${environment.API_URL}/auth/request-password-reset`, {
        username: this.formControls['email'].value,
      })
      .subscribe({
        next: () => {
          this.messageService.sendMessage(MESSAGES.FORGOT_PASSWORD_INFO);
          this.loadingResetPassword = false;
        },
        error: () => {
          this.messageService.sendMessage(MESSAGES.FORGOT_PASSWORD_ERROR);
          this.loadingResetPassword = false;
        },
      });
  }
}
