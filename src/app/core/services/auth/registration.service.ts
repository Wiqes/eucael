import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { MESSAGES } from '../../constants/messages';
import { MessageService } from '../message.service';
import { ICredentials } from '../../models/credentials.model';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  isLoading = signal(false);
  isOtpRequested = signal(false);
  isPasswordConfirmationRequested = signal(false);

  request({ email, password, otp }: ICredentials) {
    this.isLoading.set(true);
    this.http
      .post<any>(`${environment.API_URL}/auth/register`, {
        username: email,
        password: password,
        otp,
      })
      .subscribe({
        next: () => {
          this.isOtpRequested.set(false);
          this.messageService.sendMessage(MESSAGES.REGISTRATION_SUCCESS);
          this.isLoading.set(false);
        },
        error: () => {
          this.messageService.sendMessage(MESSAGES.REGISTRATION_FAILED);
          this.isLoading.set(false);
        },
      });
  }

  requestOTP(email: string) {
    this.isLoading.set(true);
    this.http
      .post<any>(`${environment.API_URL}/auth/request-otp`, {
        username: email,
      })
      .subscribe({
        next: () => {
          this.messageService.sendMessage(MESSAGES.OTP_SENT);
          this.isLoading.set(false);
          this.isOtpRequested.set(true);
          this.isPasswordConfirmationRequested.set(false);
        },
        error: () => {
          this.messageService.sendMessage(MESSAGES.OTP_REQUEST_FAILED);
          this.isLoading.set(false);
        },
      });
  }
}
