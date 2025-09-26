import { HttpInterceptorFn } from '@angular/common/http';

export const withCredentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip credentials for S3 requests and image preload requests
  const s3Host = 'wiqes-images.s3.us-east-1.amazonaws.com';

  if (req.url.includes(s3Host)) {
    return next(req);
  }

  // For all other requests, include credentials
  const credentialsReq = req.clone({
    withCredentials: true,
  });

  return next(credentialsReq);
};
