import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class FingerprintService {
  private readonly platformId = inject(PLATFORM_ID);

  getFingerprint(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return btoa('server-side-fallback');
    }

    const quickComponents = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform,
    ].join('|');

    return btoa(quickComponents);
  }
}
