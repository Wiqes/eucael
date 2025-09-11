import { Injectable, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

@Injectable({
  providedIn: 'root',
})
export class PwaInstallService {
  private platformId = inject(PLATFORM_ID);

  // Signals for reactive state management
  isInstallable = signal(false);
  isInstalled = signal(false);
  showFallbackButton = signal(false);

  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  constructor() {
    this.initializePwaService();
  }

  private initializePwaService(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.isInstallable.set(true);
    });

    // Listen for the appinstalled event
    window.addEventListener('appinstalled', () => {
      this.isInstalled.set(true);
      this.isInstallable.set(false);
      this.deferredPrompt = null;
    });

    // Check if the app is already installed
    this.checkIfInstalled();

    // Additional check for browsers that don't fire beforeinstallprompt immediately
    setTimeout(() => {
      if (!this.isInstallable() && !this.isInstalled()) {
        const criteria = this.checkInstallCriteria();

        // Show fallback button if basic criteria are met but beforeinstallprompt hasn't fired
        if (criteria.hasServiceWorker && criteria.hasManifest && criteria.isHttps) {
          this.showFallbackButton.set(true);
          this.showFallbackButton.set(true);
        }
      }
    }, 5000);
  }

  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      this.showManualInstallGuidance();
      return false;
    }

    try {
      // Show the install prompt
      await this.deferredPrompt.prompt();

      // Wait for the user's response
      const choiceResult = await this.deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        this.isInstallable.set(false);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.showManualInstallGuidance();
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  private showManualInstallGuidance(): void {
    const userAgent = navigator.userAgent;
    let instructions = '';

    if (userAgent.includes('Chrome') || userAgent.includes('Chromium')) {
      instructions = 'Chrome: Click the three dots menu → "Add to Home Screen" or "Install"';
    } else if (userAgent.includes('Firefox')) {
      instructions =
        'Firefox: Click the address bar icon or three lines menu → "Add to Home Screen"';
    } else if (userAgent.includes('Safari')) {
      instructions = 'Safari: Tap the Share button → "Add to Home Screen"';
    } else {
      instructions = 'Check your browser\'s menu for "Add to Home Screen" or "Install App" option';
    }
  }

  private checkIfInstalled(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Check if running in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    // Check if running as PWA on iOS
    const isIosPwa = (window.navigator as any).standalone === true;

    if (isStandalone || isIosPwa) {
      this.isInstalled.set(true);
    }
  }

  // Method to check PWA installation criteria
  checkInstallCriteria(): {
    hasServiceWorker: boolean;
    hasManifest: boolean;
    isHttps: boolean;
    hasRequiredIcons: boolean;
  } {
    if (!isPlatformBrowser(this.platformId)) {
      return {
        hasServiceWorker: false,
        hasManifest: false,
        isHttps: false,
        hasRequiredIcons: false,
      };
    }

    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasManifest = document.querySelector('link[rel="manifest"]') !== null;
    const isHttps =
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    // This is a simple check - in production you'd want to verify the manifest content
    const hasRequiredIcons = true; // Assume icons are properly configured

    return {
      hasServiceWorker,
      hasManifest,
      isHttps,
      hasRequiredIcons,
    };
  }
}
