// Service Worker for adding Cache-Control headers to S3 requests

const S3_HOST = 'https://wiqes-images.s3.us-east-1.amazonaws.com';
const CACHE_CONTROL_HEADER = 'public, max-age=31536000, immutable';

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  // Claim clients immediately
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const requestUrl = event.request.url;

  // Only intercept requests to S3
  if (requestUrl.includes(S3_HOST)) {
    event.respondWith(handleS3Request(event.request));
  }
});

async function handleS3Request(request) {
  try {
    // Clone the request to modify headers
    const modifiedRequest = new Request(request, {
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'Cache-Control': CACHE_CONTROL_HEADER,
      },
    });

    // Make the request with modified headers
    const response = await fetch(modifiedRequest);

    return response;
  } catch (error) {
    console.error('Service Worker: Error handling S3 request', error);
    // Fallback to original request if there's an error
    return fetch(request);
  }
}
