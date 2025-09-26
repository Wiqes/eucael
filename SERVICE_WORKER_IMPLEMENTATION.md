# Service Worker Implementation for S3 Cache-Control Headers

## Overview

This implementation adds a service worker that automatically adds `Cache-Control: public, max-age=31536000, immutable` header to all requests made to `https://wiqes-images.s3.us-east-1.amazonaws.com`.

## Implementation Details

### Files Created/Modified

1. **`src/sw.js`** - The service worker file that intercepts requests
2. **`src/app/core/services/service-worker.service.ts`** - Angular service to manage service worker registration
3. **`src/main.ts`** - Modified to register the service worker after app initialization
4. **`angular.json`** - Updated to include the service worker as a build asset
5. **`src/app/shared/components/service-worker-test.component.ts`** - Test component to verify functionality

### How It Works

1. **Service Worker Registration**: When the Angular app starts, it automatically registers the service worker (`sw.js`)

2. **Request Interception**: The service worker listens for all `fetch` events and checks if the request URL contains the S3 host

3. **Header Addition**: For S3 requests, it clones the request and adds the `Cache-Control` header while preserving all existing headers

4. **Fallback**: If there's any error, it falls back to making the original request without modification

### Key Features

- **Non-Intrusive**: Only affects requests to the specific S3 bucket
- **Header Preservation**: Adds the Cache-Control header without removing existing headers
- **Error Handling**: Graceful fallback to original request if there are issues
- **Development Friendly**: Works in development mode and production

### Testing the Implementation

1. Navigate to `/sw-test` in your application
2. Click "Check SW Status" to verify the service worker is registered
3. Click "Test S3 Request" to make a request to the S3 bucket (you can monitor network activity in browser dev tools to see the added header)

### Browser Developer Tools Verification

To verify the Cache-Control header is being added:

1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Navigate to `/sw-test`
4. Click "Test S3 Request"
5. Look at the request headers - you should see `Cache-Control: public, max-age=31536000, immutable`

### Deployment Notes

- The service worker is automatically included in the build process
- No additional configuration needed for production deployment
- The service worker will be available at `/sw.js` in your deployed application

## Comparison with Interceptor Approach

Your existing `credentials.interceptor.ts` already adds this header for S3 requests using Angular's HTTP interceptor. The service worker approach provides:

- **Lower level control**: Works for all requests, not just Angular HTTP client requests
- **Broader coverage**: Catches requests made by other parts of the application
- **Redundancy**: Provides a backup mechanism if the interceptor approach fails

Both approaches can coexist safely - the service worker adds an additional layer of header management.
