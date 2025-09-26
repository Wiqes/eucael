// Service Worker for caching S3 images with proper Cache-Control headers

const S3_HOST = 'wiqes-images.s3.us-east-1.amazonaws.com';
const CACHE_NAME = 'alseids-s3-images-v1';
const CACHE_CONTROL_HEADER = 'public, max-age=31536000, immutable';

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );
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

  // Only intercept GET requests to S3 (images)
  if (event.request.method === 'GET' && requestUrl.includes(S3_HOST)) {
    console.log('Service Worker: Intercepting S3 image request:', requestUrl);
    event.respondWith(handleS3ImageRequest(event.request));
  }
});

async function handleS3ImageRequest(request) {
  const cacheKey = request.url;

  try {
    // Check if we have this image cached
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(cacheKey);

    if (cachedResponse) {
      console.log('Service Worker: Serving from cache:', cacheKey);
      return cachedResponse;
    }

    console.log('Service Worker: Fetching and caching:', cacheKey);

    // Fetch the image from S3
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Clone the response to cache it
      const responseToCache = networkResponse.clone();

      // Create a new response with proper cache headers
      const headers = new Headers(responseToCache.headers);
      headers.set('Cache-Control', CACHE_CONTROL_HEADER);

      const cachedResponseInit = {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
      };

      const body = await responseToCache.arrayBuffer();
      const responseWithCacheHeaders = new Response(body, cachedResponseInit);

      // Cache the response
      await cache.put(cacheKey, responseWithCacheHeaders.clone());

      console.log('Service Worker: Cached image with proper headers:', cacheKey);
      return responseWithCacheHeaders;
    } else {
      console.warn('Service Worker: Failed to fetch image:', networkResponse.status, cacheKey);
      return networkResponse;
    }
  } catch (error) {
    console.error('Service Worker: Error handling S3 request:', error);
    // Fallback to network request
    return fetch(request);
  }
}
