import { computed, inject, Injectable } from '@angular/core';
import { LoginService } from './login.service';
import { RegistrationService } from './registration.service';
import { PasswordResetService } from './password-reset.service';
import { ICredentials } from '../../models/credentials.model';
import { jwtDecode } from 'jwt-decode';
import { AuthTokenStateService } from '../state/auth-token-state.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loginService = inject(LoginService);
  private authTokenStateService = inject(AuthTokenStateService);
  private registrationService = inject(RegistrationService);
  private passwordResetService = inject(PasswordResetService);
  isLoadingLogin = computed(() => this.loginService.isLoading());
  isLoadingRegistration = computed(() => this.registrationService.isLoading());
  isOtpRequested = computed(() => this.registrationService.isOtpRequested());
  isPasswordConfirmationRequested = computed(() =>
    this.registrationService.isPasswordConfirmationRequested(),
  );
  isResetPasswordRequested = computed(() => this.passwordResetService.isLoading());
  private token = computed(() => this.authTokenStateService.token());

  hasRole(role: string): boolean {
    if (!this.token()) {
      return false;
    }
    const decodedToken: any = jwtDecode(this.token() || '');
    return decodedToken.roles?.includes(role);
  }

  login(email: string, password: string) {
    this.loginService.request({ email, password });
  }

  register({ email, password, otp }: ICredentials) {
    this.registrationService.request({ email, password, otp });
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
    this.passwordResetService.request({ email });
  }
}
