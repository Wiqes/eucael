import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { translationProvider } from './translation.provider';
import { primeNGProvider } from './prime-ng.provider';
import { routerProvider } from './router.provider';
import { authInterceptor } from '../core/interceptors/auth.interceptor';
import { withCredentialsInterceptor } from '../core/interceptors/credentials.interceptor';

import localeEnUS from '@angular/common/locales/en';
import localeEsES from '@angular/common/locales/es';
import localeZhCN from '@angular/common/locales/zh';
import localeHiIN from '@angular/common/locales/hi';
import localeArSA from '@angular/common/locales/ar-SA';
import localeBnBD from '@angular/common/locales/bn';
import localePtBR from '@angular/common/locales/pt';
import localeRuRU from '@angular/common/locales/ru';
import localeJaJP from '@angular/common/locales/ja';
import localePaIN from '@angular/common/locales/pa';
import localeDeDE from '@angular/common/locales/de';
import localeFrFR from '@angular/common/locales/fr';
import localeTrTR from '@angular/common/locales/tr';
import localeItIT from '@angular/common/locales/it';
import localeViVN from '@angular/common/locales/vi';
import localeTaIN from '@angular/common/locales/ta';
import localeUrPK from '@angular/common/locales/ur';
import localeIdID from '@angular/common/locales/id';
import localeSwKE from '@angular/common/locales/sw';
import localeMrIN from '@angular/common/locales/mr';
import localeTeIN from '@angular/common/locales/te';
import localeUkUA from '@angular/common/locales/uk';
import { registerLocaleData } from '@angular/common';
import { environment } from '../../environments/environment';
import { provideSocketIo, SocketIoConfig } from 'ngx-socket-io';
import { provideServiceWorker } from '@angular/service-worker';

registerLocaleData(localeEnUS, 'en-US');
registerLocaleData(localeEsES, 'es-ES');
registerLocaleData(localeZhCN, 'zh-CN');
registerLocaleData(localeHiIN, 'hi-IN');
registerLocaleData(localeArSA, 'ar-SA');
registerLocaleData(localeBnBD, 'bn-BD');
registerLocaleData(localePtBR, 'pt-BR');
registerLocaleData(localeRuRU, 'ru-RU');
registerLocaleData(localeJaJP, 'ja-JP');
registerLocaleData(localePaIN, 'pa-IN');
registerLocaleData(localeDeDE, 'de-DE');
registerLocaleData(localeFrFR, 'fr-FR');
registerLocaleData(localeTrTR, 'tr-TR');
registerLocaleData(localeItIT, 'it-IT');
registerLocaleData(localeViVN, 'vi-VN');
registerLocaleData(localeTaIN, 'ta-IN');
registerLocaleData(localeUrPK, 'ur-PK');
registerLocaleData(localeIdID, 'id-ID');
registerLocaleData(localeSwKE, 'sw-KE');
registerLocaleData(localeMrIN, 'mr-IN');
registerLocaleData(localeTeIN, 'te-IN');
registerLocaleData(localeUkUA, 'uk-UA');

const socketConfig: SocketIoConfig = {
  url: environment.API_URL,
  options: {
    autoConnect: false,
    transports: ['websocket', 'polling'],
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([withCredentialsInterceptor, authInterceptor])),
    routerProvider(),
    provideSocketIo(socketConfig),
    translationProvider(),
    ...primeNGProvider(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
