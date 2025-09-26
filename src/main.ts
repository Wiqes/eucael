import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/config/config';
import { AppComponent } from './app/app.component';

// Register service worker immediately, before app bootstrap
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js', { scope: '/' })
    .then((registration) => {
      console.log('Service Worker registered early:', registration);
      // Force immediate activation
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    })
    .catch((error) => {
      console.error('Early Service Worker registration failed:', error);
    });
}

bootstrapApplication(AppComponent, appConfig)
  .then((appRef) => {
    console.log('Angular app bootstrapped successfully');
  })
  .catch((err) => console.error(err));
