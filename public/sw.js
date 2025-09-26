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
  // Claim clients immediately to handle existing pages
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Received SKIP_WAITING message');
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const requestUrl = event.request.url;

  // Only intercept requests to S3 (including preflight OPTIONS requests)
  if (requestUrl.includes(S3_HOST)) {
    console.log('Service Worker: Intercepting S3 request:', event.request.method, requestUrl);
    event.respondWith(handleS3Request(event.request));
  }
});

async function handleS3Request(request) {
  try {
    // Handle preflight OPTIONS requests specially
    if (request.method === 'OPTIONS') {
      console.log('Service Worker: Handling OPTIONS preflight request');
      // For OPTIONS requests, we typically want to let them pass through
      // but still add cache headers
      const modifiedRequest = new Request(request, {
        headers: {
          ...Object.fromEntries(request.headers.entries()),
          'Cache-Control': CACHE_CONTROL_HEADER,
        },
      });
      return await fetch(modifiedRequest);
    }

    // For GET requests and other methods, clone and modify headers
    const existingHeaders = Object.fromEntries(request.headers.entries());

    // Only add Cache-Control if it doesn't already exist (avoid duplicate headers)
    if (!existingHeaders['cache-control'] && !existingHeaders['Cache-Control']) {
      existingHeaders['Cache-Control'] = CACHE_CONTROL_HEADER;
    }

    const modifiedRequest = new Request(request, {
      headers: existingHeaders,
    });

    console.log(
      'Service Worker: Making modified S3 request with headers:',
      Object.keys(existingHeaders),
    );
    const response = await fetch(modifiedRequest);

    // Log successful response
    console.log('Service Worker: S3 request completed:', response.status, response.statusText);
    return response;
  } catch (error) {
    console.error('Service Worker: Error handling S3 request:', error);
    // Fallback to original request if there's an error
    return fetch(request);
  }
}
