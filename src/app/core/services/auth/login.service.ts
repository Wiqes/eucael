import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MESSAGES } from '../../constants/messages';
import { ICredentials } from '../../models/credentials.model';
import { AuthBaseService } from './auth-base.service';
import { AuthTokenService } from './auth-token.service';
import { FingerprintService } from '../fingerprint.service';
import { ITokenData } from '../../models/token-data.model';
import { AuthTokenStateService } from '../state/auth-token-state.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService extends AuthBaseService {
  private router = inject(Router);
  private authTokenService = inject(AuthTokenService);
  private authTokenStateService = inject(AuthTokenStateService);
  private fingerprintService = inject(FingerprintService);

  private getFingerprint(): string {
    return this.fingerprintService.getFingerprint();
  }

  request({ email, password }: ICredentials) {
    const fingerprint = this.getFingerprint();
    this.makeAuthRequest(
      '/auth/login',
      { username: email, password, fingerprint },
      (res) => this.onLoginSuccess(res),
      () => this.handleError(MESSAGES.LOGIN_FAILED),
      false, // Disable regular loading for login to avoid conflicts with the auth token service
    );
  }

  private onLoginSuccess(res: ITokenData): void {
    if (res?.access_token) {
      this.authTokenStateService.token.set(res.access_token);
    } else {
      this.authTokenStateService.token.set(null);
    }

    this.handleSuccess(null, () => {
      setTimeout(() => {
        this.router.navigate(['/home']);
        this.isLoading.set(false);
      }, 800);
    });
  }

  logout(): void {
    this.authTokenService.logout();
  }
}
