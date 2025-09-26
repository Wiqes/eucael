import { HttpInterceptorFn } from '@angular/common/http';
import { PRELOAD_IMAGE } from './auth.interceptor';

export const withCredentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip credentials for S3 requests and image preload requests
  const s3Host = 'wiqes-images.s3.us-east-1.amazonaws.com';
  const isImagePreload = req.context.get(PRELOAD_IMAGE);

  if (req.url.includes(s3Host) || isImagePreload) {
    // For S3 and image preload requests, don't include credentials
    // Cache-Control is now handled by the service worker
    return next(req);
  }

  // For all other requests, include credentials
  const credentialsReq = req.clone({
    withCredentials: true,
  });

  return next(credentialsReq);
};
