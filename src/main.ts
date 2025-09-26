import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/config/config';
import { AppComponent } from './app/app.component';

// Register service worker for image caching
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js', { scope: '/' })
    .then((registration) => {
      console.log('Service Worker registered:', registration);

      // Force immediate activation of waiting service worker
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker installed, activating...');
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }
      });

      // Listen for service worker controller changes (updates)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed, reloading page');
        window.location.reload();
      });
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}

bootstrapApplication(AppComponent, appConfig)
  .then((appRef) => {
    console.log('Angular app bootstrapped successfully');
  })
  .catch((err) => console.error(err));
