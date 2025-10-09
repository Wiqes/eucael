import { computed, inject, Injectable } from '@angular/core';
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
import { AuthTokenStateService } from '../state/auth-token-state.service';

@Injectable({
  providedIn: 'root',
})
export class AuthTokenService {
  private router = inject(Router);
  private stateService = inject(StateService);
  private chatStateService = inject(ChatStateService);
  private authTokenStateService = inject(AuthTokenStateService);
  private fingerprintService = inject(FingerprintService);
  private http = inject(HttpClient);
  token = computed(() => this.authTokenStateService.token());
  private isRefreshing = computed(() => this.authTokenStateService.isRefreshing());

  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  logout(): void {
    this.stateService.isDataLoading.set(true);
    const token = this.token();
    const options = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    this.http.post<any>(`${environment.API_URL}/auth/logout`, {}, options).subscribe({
      next: () => {
        this.authTokenStateService.isRefreshing.set(false);
        this.refreshTokenSubject.next(null);
        this.moveToLogin();
      },
      error: () => {
        this.moveToLogin();
      },
    });
  }

  moveToLogin(): void {
    this.authTokenStateService.token.set(null);
    this.stateService.user.set(null);
    this.stateService.tokenProfile.set(null);
    this.chatStateService.chats.set(null);
    this.router.navigateByUrl('/', { replaceUrl: true }).finally(() => {
      this.stateService.isDataLoading.set(false);
    });
  }

  private getTokenExpiration(): number | null {
    const token = this.token();
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

  isTokenExpiringSoon(bufferSeconds = 60): boolean {
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
    if (this.isRefreshing()) {
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
      );
    }

    // Set refreshing state
    this.authTokenStateService.isRefreshing.set(true);
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
          this.authTokenStateService.isRefreshing.set(false);
        }),
      );
  }

  private onRefreshSuccess(tokenData: ITokenData): void {
    const token = tokenData?.access_token || null;
    if (!token) {
      return;
    }
    this.authTokenStateService.token.set(token);
  }
}
