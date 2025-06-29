import { inject, Injectable } from '@angular/core';
import { MessageService } from '../message.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { MESSAGES } from '../../constants/messages';
import { StateService } from '../state.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private stateService = inject(StateService);
  isLoading = false;

  request(email: string, password: string) {
    this.isLoading = true;
    this.http
      .post<any>(`${environment.API_URL}/auth/login`, {
        username: email,
        password,
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
            if (!this.stateService.user()) {
              this.stateService.user.set({ displayName: email || '' });
            }

            this.isLoading = false;
          }, 800);
        },
        error: () => {
          this.messageService.sendMessage(MESSAGES.LOGIN_FAILED);
          this.isLoading = false;
        },
      });
  }
}
