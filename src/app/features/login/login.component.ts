import { Component, inject, effect, computed } from '@angular/core';
import { FormBuilder, FormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ReactiveFormsModule } from '@angular/forms';
import { GoogleButtonComponent } from '../../shared/ui/google-button/google-button.component';
import { FormControlComponent } from '../../shared/ui/form-control/form-control.component';
import { MessageService } from '../../core/services/message.service';
import { MESSAGES } from '../../core/constants/messages';
import { AuthService } from '../../core/services/auth/auth.service';
import { ForgotPasswordButtonComponent } from '../../shared/ui/forgot-password-button/forgot-password-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { LoginService } from '../../core/services/auth/login.service';
import { StateService } from '../../core/services/state.service';
import { Router } from '@angular/router';
import { LoginImageComponent } from './login-image/login-image.component';
import { LogoContainerComponent } from './logo-container/logo-container.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    ReactiveFormsModule,
    TranslateModule,
    DividerModule,
    GoogleButtonComponent,
    FormControlComponent,
    ForgotPasswordButtonComponent,
    LoginImageComponent,
    LogoContainerComponent,
    NgIf,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loadingResetPassword = false;

  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly authService = inject(AuthService);
  private readonly loginService = inject(LoginService);
  private readonly stateService = inject(StateService);
  isLoggedIn = computed(() => this.loginService.isLoggedIn());
  user = computed(() => this.stateService.user());
  isDataLoading = computed(() => this.stateService.isDataLoading());

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

    effect(() => {
      const user = this.user();

      if (user) {
        this.router.navigate(['/home']);
      }
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

    this.authService.register({ email, password, otp });
  }

  backToLogin() {
    this.authService.reset();
    this.formControls['otp'].setValue('');
    this.formControls['confirmPassword'].setValue('');
  }
}
