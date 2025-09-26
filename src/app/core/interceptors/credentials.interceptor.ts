import { HttpInterceptorFn } from '@angular/common/http';
import { PRELOAD_IMAGE } from './auth.interceptor';

export const withCredentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip credentials for S3 requests and image preload requests
  const s3Host = 'https://wiqes-images.s3.us-east-1.amazonaws.com';
  const isImagePreload = req.context.get(PRELOAD_IMAGE);

  if (req.url.includes(s3Host) || isImagePreload) {
    return next(req);
  }

  const credentialsReq = req.clone({
    withCredentials: true,
  });

  return next(credentialsReq);
};
