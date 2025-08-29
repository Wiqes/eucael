import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  Observable,
  tap,
  catchError,
  throwError,
  BehaviorSubject,
  filter,
  take,
  switchMap,
  finalize,
} from 'rxjs';
import { StateService } from '../state.service';
import { FingerprintService } from '../fingerprint.service';
import { ITokenData } from '../../models/token-data.model';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthTokenService {
  private router = inject(Router);
  private stateService = inject(StateService);
  private fingerprintService = inject(FingerprintService);
  private http = inject(HttpClient);

  isLoggedIn = signal(false);

  // BehaviorSubject to manage refresh token state and prevent race conditions
  private isRefreshing = new BehaviorSubject<boolean>(false);
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  logout(): void {
    this.isLoggedIn.set(false);
    this.isRefreshing.next(false);
    this.refreshTokenSubject.next(null);
    try {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('expires_in');
      this.stateService.user.set(null);
      this.router.navigate(['']);
    } catch (e) {
      console.error('Error during logout:', e);
    }
  }

  getToken(): string | null {
    try {
      return window.localStorage.getItem('token');
    } catch (e) {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const expiresIn = localStorage.getItem('expires_in');
    if (!expiresIn) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = parseInt(expiresIn, 10);

    return currentTime >= expirationTime;
  }

  isTokenExpiringSoon(bufferSeconds: number = 60): boolean {
    const expiresIn = localStorage.getItem('expires_in');
    if (!expiresIn) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = parseInt(expiresIn, 10);

    return currentTime + bufferSeconds >= expirationTime;
  }

  private getFingerprint(): string {
    return this.fingerprintService.getFingerprint();
  }

  // Improved method that handles race conditions and returns proper observables
  refreshToken(): Observable<string> {
    // If already refreshing, wait for the current refresh to complete
    if (this.isRefreshing.value) {
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
      );
    }

    // Set refreshing state
    this.isRefreshing.next(true);
    this.refreshTokenSubject.next(null);

    const fingerprint = this.getFingerprint();

    return this.http
      .post<ITokenData>(
        `${environment.API_URL}/auth/refresh`,
        { fingerprint },
        {
          withCredentials: true, // Ensure cookies (refresh token) are sent
        },
      )
      .pipe(
        tap((tokenData: ITokenData) => {
          this.onRefreshSuccess(tokenData);
          this.refreshTokenSubject.next(tokenData.access_token);
        }),
        switchMap((tokenData: ITokenData) => {
          return new Observable<string>((subscriber) => {
            subscriber.next(tokenData.access_token);
            subscriber.complete();
          });
        }),
        catchError((error) => {
          this.refreshTokenSubject.next(null);
          // If refresh fails, it likely means the refresh token is invalid
          if (error.status === 401 || error.status === 403) {
            this.logout();
          }
          return throwError(() => error);
        }),
        finalize(() => {
          this.isRefreshing.next(false);
        }),
      );
  }

  private onRefreshSuccess(tokenData: ITokenData): void {
    // Try to save token in a more robust way
    try {
      if (tokenData?.access_token) {
        window.localStorage.setItem('token', tokenData.access_token);
      }
      window.localStorage.setItem('expires_in', tokenData.expires_in.toString());
    } catch (e) {
      console.error('Error saving token:', e);
    }
  }
}
