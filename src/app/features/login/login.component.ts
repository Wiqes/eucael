import { Component, inject, signal, effect, computed, linkedSignal } from '@angular/core';
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
import { StateService } from '../../core/services/state.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { combineLatest } from 'rxjs';

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
  loadingResetPassword = false;

  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);

  loadingLogin = computed(() => this.authService.isLoadingLogin());
  loadingRegistration = computed(() => this.authService.isLoadingRegistration());
  otpRequested = computed(() => this.authService.isOtpRequested());
  passwordConfirmationRequested = computed(() =>
    this.authService.isPasswordConfirmationRequested(),
  );

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
    const email = this.formControls['email'].value || '';
    const password = this.formControls['password'].value || '';
    this.authService.login(email, password);
  }

  requestPasswordConfirmation() {
    this.authService.requestPasswordConfirmation();
  }

  requestOTP() {
    if (this.formControls['password'].value !== this.formControls['confirmPassword'].value) {
      this.formControls['confirmPassword'].setErrors({ mismatch: true });
      this.messageService.sendMessage(MESSAGES.PASSWORD_MISMATCH);
      return;
    }

    const email = this.formControls['email'].value || '';
    this.authService.requestOTP(email);
  }

  register() {
    const email = this.formControls['email'].value || '';
    const password = this.formControls['password'].value || '';
    const otp = this.formControls['otp'].value || '';

    this.authService.register(email, password, otp);
  }

  backToLogin() {
    this.authService.reset();
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
