import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StateService } from '../state.service';
import { AuthBaseService } from './auth-base.service';
import { FingerprintService } from '../fingerprint.service';

@Injectable({
  providedIn: 'root',
})
export class AuthTokenService extends AuthBaseService {
  private router = inject(Router);
  private stateService = inject(StateService);
  private fingerprintService = inject(FingerprintService);

  isLoggedIn = signal(false);

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

  private getFingerprint(): string {
    return this.fingerprintService.getFingerprint();
  }

  request() {
    const fingerprint = this.getFingerprint();

    this.makeAuthRequest(
      '/auth/refresh',
      { fingerprint },
      () => this.handleSuccess(null),
      () => this.handleError(null),
    );
  }
}
