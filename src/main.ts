import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/config/config';
import { AppComponent } from './app/app.component';
import { ServiceWorkerService } from './app/core/services/service-worker.service';

bootstrapApplication(AppComponent, appConfig)
  .then((appRef) => {
    // Register service worker after app initialization
    const serviceWorkerService = appRef.injector.get(ServiceWorkerService);
    serviceWorkerService.registerServiceWorker();
  })
  .catch((err) => console.error(err));
