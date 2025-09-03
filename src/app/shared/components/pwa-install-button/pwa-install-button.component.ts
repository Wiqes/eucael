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
      size="small"
      (onClick)="installPwa()"
      styleClass="install-button"
    ></p-button>
    }
  `,
  styles: [
    `
      :host {
        position: fixed;
        padding: 12px 16px;
        bottom: 20px;
        z-index: 1000;
        width: 100%;
      }

      :host ::ng-deep .p-button {
        background: blue;
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
