import { HttpInterceptorFn } from '@angular/common/http';

export const withCredentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const credentialsReq = req.clone({
    withCredentials: true,
  });

  return next(credentialsReq);
};
