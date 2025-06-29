import { Injectable, signal } from '@angular/core';
import { MESSAGES } from '../../constants/messages';
import { ICredentials } from '../../models/credentials.model';
import { AuthBaseService } from './auth-base.service';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService extends AuthBaseService {
  isOtpRequested = signal(false);
  isPasswordConfirmationRequested = signal(false);

  request({ email, password, otp }: ICredentials) {
    this.makeAuthRequest(
      '/auth/register',
      { username: email, password, otp },
      () => this.onRegistrationSuccess(),
      () => this.handleError(MESSAGES.REGISTRATION_FAILED),
    );
  }

  requestOTP(email: string) {
    this.makeAuthRequest(
      '/auth/request-otp',
      { username: email },
      () => this.onOTPRequestSuccess(),
      () => this.handleError(MESSAGES.OTP_REQUEST_FAILED),
    );
  }

  private onRegistrationSuccess(): void {
    this.isOtpRequested.set(false);
    this.handleSuccess(MESSAGES.REGISTRATION_SUCCESS);
  }

  private onOTPRequestSuccess(): void {
    this.handleSuccess(MESSAGES.OTP_SENT, () => {
      this.isOtpRequested.set(true);
      this.isPasswordConfirmationRequested.set(false);
    });
  }
}
