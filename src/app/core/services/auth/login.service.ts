import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MESSAGES } from '../../constants/messages';
import { StateService } from '../state.service';
import { ICredentials } from '../../models/credentials.model';
import { AuthBaseService } from './auth-base.service';
import { AuthTokenService } from './auth-token.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService extends AuthBaseService {
  private router = inject(Router);
  private stateService = inject(StateService);
  private authTokenService = inject(AuthTokenService);

  isLoggedIn = computed(() => this.authTokenService.isLoggedIn());

  request({ email, password }: ICredentials) {
    this.makeAuthRequest(
      '/auth/login',
      { username: email, password },
      (res) => this.onLoginSuccess(res, email),
      () => this.handleError(MESSAGES.LOGIN_FAILED),
      false, // Disable regular loading for login to avoid conflicts with the auth token service
    );
  }

  private onLoginSuccess(res: any, email?: string): void {
    this.authTokenService.isLoggedIn.set(true);
    // Try to save token in a more robust way
    try {
      if (res?.access_token) {
        window.localStorage.setItem('token', res.access_token);
      }
    } catch (e) {
      this.messageService.sendMessage(MESSAGES.STORAGE_ERROR);
    }

    this.handleSuccess(null, () => {
      setTimeout(() => {
        this.router.navigate(['/home']);
        this.stateService.addBackendDataToState();
        this.isLoading.set(false);
      }, 800);
    });
  }

  logout(): void {
    this.authTokenService.logout();
  }
}
