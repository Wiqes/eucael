import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { translationProvider } from './translation.provider';
import { primeNGProvider } from './prime-ng.provider';
import { routerProvider } from './router.provider';
import { authInterceptor } from '../core/auth.interceptor';
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([authInterceptor])),
    routerProvider(),
    translationProvider(),
    ...primeNGProvider(),
  ],
};
