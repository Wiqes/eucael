import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MESSAGES } from '../../constants/messages';
import { StateService } from '../state.service';
import { ICredentials } from '../../models/credentials.model';
import { AuthBaseService } from './auth-base.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService extends AuthBaseService {
  private router = inject(Router);
  private stateService = inject(StateService);
  isLoggedIn = signal(false);

  request({ email, password }: ICredentials) {
    this.makeAuthRequest(
      '/auth/login',
      { username: email, password },
      (res) => this.onLoginSuccess(res, email),
      () => this.handleError(MESSAGES.LOGIN_FAILED),
    );
  }

  private onLoginSuccess(res: any, email?: string): void {
    this.isLoggedIn.set(true);
    // Try to save token in a more robust way
    try {
      if (res?.access_token) {
        window.localStorage.setItem('token', res.access_token);
      }
    } catch (e) {
      this.messageService.sendMessage(MESSAGES.STORAGE_ERROR);
    }

    this.handleSuccess(MESSAGES.LOGIN_SUCCESS, () => {
      setTimeout(() => {
        this.router.navigate(['/home']);
        this.stateService.addBackendDataToState();
      }, 800);
    });
  }

  logout(): void {
    this.isLoggedIn.set(false);
    try {
      window.localStorage.removeItem('token');
      this.stateService.user.set(null);
      this.router.navigate(['']);
    } catch (e) {
      console.error('Error during logout:', e);
    }
  }
}
