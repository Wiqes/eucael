import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ServiceWorkerService {
  constructor() {}

  async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        // First check if there's already a service worker controlling the page
        const existingRegistration = await navigator.serviceWorker.getRegistration();

        if (existingRegistration && existingRegistration.active) {
          console.log('Service Worker already active:', existingRegistration);
          return;
        }

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
                console.log('New service worker available - consider reloading');
                // Force the new service worker to become active
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
