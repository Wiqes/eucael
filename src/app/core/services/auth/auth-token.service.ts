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
import { ChatStateService } from '../state/chat-state.service';
import { ChatService } from '../chat/chat.service';

@Injectable({
  providedIn: 'root',
})
export class AuthTokenService {
  private router = inject(Router);
  private stateService = inject(StateService);
  private chatStateService = inject(ChatStateService);
  private chatService = inject(ChatService);
  private fingerprintService = inject(FingerprintService);
  private http = inject(HttpClient);

  isLoggedIn = signal(false);

  // BehaviorSubject to manage refresh token state and prevent race conditions
  private isRefreshing = new BehaviorSubject<boolean>(false);
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  setToken(token: string | null): void {
    if (token) {
      try {
        window.localStorage.setItem('token', token);
      } catch (e) {
        console.error('Error storing token:', e);
      }
      this.isLoggedIn.set(true);
    } else {
      try {
        window.localStorage.removeItem('token');
      } catch (e) {
        // ignore
      }
      this.isLoggedIn.set(false);
    }
  }

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
    this.chatStateService.chats.set(null);
    this.router.navigateByUrl('/', { replaceUrl: true }).finally(() => {
      this.stateService.isDataLoading.set(false);
    });
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
    const token = tokenData?.access_token || null;
    if (!token) {
      return;
    }
    this.setToken(token);

    if (!this.chatService.isUserAuthenticated()) {
      console.log('Reconnecting chat service after token refresh');
      this.chatService.disconnect();
      this.chatService.connect(token);
    }
  }
}
