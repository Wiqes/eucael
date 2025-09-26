import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ServiceWorkerService {
  constructor() {}

  async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('Service Worker registered successfully:', registration);

        // Wait for the service worker to become active
        await this.waitForServiceWorkerActive(registration);

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New service worker available - activating');
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    } else {
      console.warn('Service Workers are not supported in this browser');
    }
  }

  async clearImageCache(): Promise<void> {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const imageCacheNames = cacheNames.filter((name) => name.includes('s3-images'));

        const deletePromises = imageCacheNames.map((cacheName) => caches.delete(cacheName));
        await Promise.all(deletePromises);

        console.log('Image caches cleared:', imageCacheNames);
      } catch (error) {
        console.error('Error clearing image cache:', error);
      }
    }
  }

  async getCacheStats(): Promise<{ caches: string[]; totalSize: number }> {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        let totalSize = 0;

        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();
          totalSize += requests.length;
        }

        return { caches: cacheNames, totalSize };
      } catch (error) {
        console.error('Error getting cache stats:', error);
        return { caches: [], totalSize: 0 };
      }
    }
    return { caches: [], totalSize: 0 };
  }

  private async waitForServiceWorkerActive(registration: ServiceWorkerRegistration): Promise<void> {
    return new Promise((resolve) => {
      if (registration.active) {
        console.log('Service Worker is already active');
        resolve();
        return;
      }

      const worker = registration.installing || registration.waiting;
      if (!worker) {
        resolve();
        return;
      }

      worker.addEventListener('statechange', () => {
        if (worker.state === 'activated') {
          console.log('Service Worker activated and ready to intercept requests');
          resolve();
        }
      });
    });
  }

  async unregisterServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
        console.log('All service workers unregistered');
      } catch (error) {
        console.error('Error unregistering service workers:', error);
      }
    }
  }
}
