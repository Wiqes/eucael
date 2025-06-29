import { inject, Injectable, signal } from '@angular/core';
import { MessageService } from '../message.service';
import { HttpClient } from '@angular/common/http';
import { MESSAGES } from '../../constants/messages';
import { environment } from '../../../../environments/environment';
import { ICredentials } from '../../models/credentials.model';

@Injectable({
  providedIn: 'root',
})
export class PasswordResetService {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  isLoading = signal(false);

  request({ email }: ICredentials) {
    this.isLoading.set(true);
    this.http
      .post<any>(`${environment.API_URL}/auth/request-password-reset`, {
        username: email,
      })
      .subscribe({
        next: () => {
          this.messageService.sendMessage(MESSAGES.FORGOT_PASSWORD_INFO);
          this.isLoading.set(false);
        },
        error: () => {
          this.messageService.sendMessage(MESSAGES.FORGOT_PASSWORD_ERROR);
          this.isLoading.set(false);
        },
      });
  }
}
