import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthTokenService } from './services/auth/auth-token.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authTokenService = inject(AuthTokenService);

  const s3Host = 'https://wiqes-images.s3.us-east-1.amazonaws.com';
  if (req.url.includes(s3Host)) {
    return next(req);
  }

  const token = localStorage.getItem('token');
  let authReq = req;

  // Clone the request to include credentials (cookies)
  authReq = req.clone({
    setHeaders: token ? {
      Authorization: `Bearer ${token}`,
    } : {},
    withCredentials: true // This ensures cookies are sent with requests
  });

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        authTokenService.logout();
      }
      return throwError(() => error);
    }),
  );
};
