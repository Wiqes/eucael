import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { PwaInstallService } from '../../core/services/pwa-install.service';

@Component({
  selector: 'app-pwa-install-button',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    @if ((pwaService.isInstallable() && !pwaService.isInstalled()) ||
    pwaService.showFallbackButton()) {
    <p-button
      [label]="'Install App'"
      severity="contrast"
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
        padding: 12px;
        bottom: 20px;
        z-index: 1000;
        width: 100%;
        display: none;

        @media (max-width: 768px) {
          display: block;
        }
      }

      :host ::ng-deep p-button {
        background: black;
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
