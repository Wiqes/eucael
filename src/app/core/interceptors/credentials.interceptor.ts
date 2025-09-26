import { HttpInterceptorFn } from '@angular/common/http';

export const withCredentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip credentials for S3 requests
  const s3Host = 'https://wiqes-images.s3.us-east-1.amazonaws.com';
  if (req.url.includes(s3Host)) {
    return next(req);
  }

  const credentialsReq = req.clone({
    withCredentials: true,
  });

  return next(credentialsReq);
};
