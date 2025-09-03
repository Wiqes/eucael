import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { PwaInstallService } from '../../../core/services/pwa-install.service';

@Component({
  selector: 'app-pwa-install-button',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    @if (pwaService.isInstallable() && !pwaService.isInstalled()) {
    <p-button
      [label]="'Install App'"
      icon="pi pi-download"
      [rounded]="true"
      [outlined]="true"
      size="small"
      (onClick)="installPwa()"
      styleClass="install-button"
    ></p-button>
    }
  `,
  styles: [
    `
      .install-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        backdrop-filter: blur(10px);
        background: rgba(52, 245, 221, 0.1) !important;
        border: 1px solid rgba(52, 245, 221, 0.3) !important;
      }

      .install-button:hover {
        background: rgba(52, 245, 221, 0.2) !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(52, 245, 221, 0.3);
      }

      @media (max-width: 768px) {
        .install-button {
          bottom: 80px; // Above mobile navigation if you have one
          right: 16px;
        }
      }
    `,
  ],
})
export class PwaInstallButtonComponent {
  pwaService = inject(PwaInstallService);

  async installPwa(): Promise<void> {
    const result = await this.pwaService.showInstallPrompt();
    if (result) {
      console.log('PWA installation successful');
    }
  }
}
