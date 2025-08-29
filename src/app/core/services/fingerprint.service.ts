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

    // Get platform information using modern API or fallback
    const platform = this.getPlatform();

    const quickComponents = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      platform,
    ].join('|');

    return btoa(quickComponents);
  }

  private getPlatform(): string {
    // Use modern User-Agent Client Hints API if available
    if ('userAgentData' in navigator) {
      const userAgentData = (navigator as any).userAgentData;
      if (userAgentData?.platform) {
        return userAgentData.platform;
      }
    }

    // Fallback: parse platform from user agent
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('windows')) return 'Windows';
    if (userAgent.includes('mac')) return 'macOS';
    if (userAgent.includes('linux')) return 'Linux';
    if (userAgent.includes('android')) return 'Android';
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'iOS';

    return 'Unknown';
  }
}
