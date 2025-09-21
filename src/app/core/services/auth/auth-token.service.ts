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
import { StateService } from '../state/state.service';
import { FingerprintService } from '../fingerprint.service';
import { ITokenData } from '../../models/token-data.model';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

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
    this.stateService.isDataLoading.set(true);
    const token = this.getToken();
    const options = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    this.http.post<any>(`${environment.API_URL}/auth/logout`, {}, options).subscribe({
      next: () => {
        this.isRefreshing.next(false);
        this.refreshTokenSubject.next(null);
        this.moveToLogin();
      },
      error: () => {
        this.moveToLogin();
      },
    });
  }

  moveToLogin(): void {
    this.isLoggedIn.set(false);
    window.localStorage.removeItem('token');
    this.stateService.user.set(null);
    this.stateService.tokenProfile.set(null);
    this.router.navigate(['']);
    this.stateService.isDataLoading.set(false);
  }

  getToken(): string | null {
    try {
      return window.localStorage.getItem('token');
    } catch (e) {
      return null;
    }
  }

  private getTokenExpiration(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.exp || null;
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  getTokenExpirationInfo(): {
    expired: boolean;
    expiresAt: Date | null;
    timeUntilExpiry: number | null;
  } {
    const exp = this.getTokenExpiration();
    if (!exp) {
      return { expired: true, expiresAt: null, timeUntilExpiry: null };
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const expiresAt = new Date(exp * 1000);
    const timeUntilExpiry = exp - currentTime;

    return {
      expired: currentTime >= exp,
      expiresAt,
      timeUntilExpiry,
    };
  }

  isTokenExpiringSoon(bufferSeconds: number = 60): boolean {
    const exp = this.getTokenExpiration();
    if (!exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);

    return currentTime + bufferSeconds >= exp;
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
          this.moveToLogin();
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
    } catch (e) {
      console.error('Error saving token:', e);
    }
  }
}
