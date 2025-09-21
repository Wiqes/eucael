import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { catchError, throwError, switchMap, filter, take } from 'rxjs';
import { AuthTokenService } from '../services/auth/auth-token.service';
import { AuthTokenStateService } from '../services/state/auth-token-state.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authTokenService = inject(AuthTokenService);
  const authTokenStateService = inject(AuthTokenStateService);
  const token = computed(() => authTokenStateService.token());

  // Skip authentication for S3 requests
  const s3Host = 'https://wiqes-images.s3.us-east-1.amazonaws.com';
  if (req.url.includes(s3Host)) {
    return next(req);
  }

  // Skip authentication for auth endpoints to prevent infinite loops
  const isAuthRequest = req.url.includes('/auth/');
  if (isAuthRequest) {
    return next(req);
  }

  return handleRequest(req, next, authTokenService, token());
};

function handleRequest(
  req: HttpRequest<any>,
  next: HttpHandlerFn,
  authTokenService: AuthTokenService,
  token: string | null,
) {
  // If token is expired or expiring soon, refresh it proactively
  if (token && authTokenService.isTokenExpiringSoon()) {
    return authTokenService.refreshToken().pipe(
      switchMap((newToken: string) => {
        const authReq = addTokenToRequest(req, newToken);
        return next(authReq);
      }),
      catchError((error) => {
        // If refresh fails, try the original request without token
        // The error handling will catch any 401 and handle accordingly
        return next(addTokenToRequest(req, null));
      }),
    );
  }

  // Add token to request and proceed
  const authReq = addTokenToRequest(req, token);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 errors with token refresh retry
      if (error.status === 401) {
        if (token) {
          return handle401Error(req, next, authTokenService);
        }
        authTokenService.moveToLogin();
      }

      return throwError(() => error);
    }),
  );
}

function handle401Error(
  req: HttpRequest<any>,
  next: HttpHandlerFn,
  authTokenService: AuthTokenService,
) {
  return authTokenService.refreshToken().pipe(
    switchMap((newToken: string) => {
      const authReq = addTokenToRequest(req, newToken);
      return next(authReq);
    }),
    catchError((refreshError) => {
      // If refresh fails, logout and return the original error
      authTokenService.moveToLogin();
      return throwError(() => refreshError);
    }),
  );
}

function addTokenToRequest(req: HttpRequest<any>, token: string | null): HttpRequest<any> {
  return req.clone({
    setHeaders: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });
}
