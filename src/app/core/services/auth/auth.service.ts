import { computed, inject, Injectable, linkedSignal } from '@angular/core';
import { LoginService } from './login.service';
import { RegistrationService } from './registration.service';
import { PasswordResetService } from './password-reset.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loginService = inject(LoginService);
  private registrationService = inject(RegistrationService);
  private passwordResetService = inject(PasswordResetService);
  isLoadingLogin = computed(() => this.loginService.isLoading());
  isLoadingRegistration = computed(() => this.registrationService.isLoading());
  isOtpRequested = computed(() => this.registrationService.isOtpRequested());
  isPasswordConfirmationRequested = computed(() =>
    this.registrationService.isPasswordConfirmationRequested(),
  );
  isResetPasswordRequested = computed(() => this.passwordResetService.isLoading());

  login(email: string, password: string) {
    this.loginService.request(email, password);
  }

  register(email: string, password: string, otp: string) {
    this.registrationService.request(email, password, otp);
  }

  requestOTP(email: string) {
    this.registrationService.requestOTP(email);
  }

  reset() {
    this.registrationService.isOtpRequested.set(false);
    this.registrationService.isPasswordConfirmationRequested.set(false);
  }

  requestPasswordConfirmation() {
    this.registrationService.isPasswordConfirmationRequested.set(true);
  }

  sendPasswordResetRequest(email: string) {
    this.passwordResetService.request(email);
  }
}
