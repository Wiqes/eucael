import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    CommonModule,
    Button,
    BadgeModule,
    OverlayPanelModule,
    ScrollPanelModule,
    TooltipModule,
  ],
  template: `
    <p-button
      icon="pi pi-bell"
      severity="secondary"
      [label]="unreadCount() > 0 ? unreadCount().toString() : ''"
      [text]="true"
      (onClick)="toggleNotificationPanel($event)"
      [pTooltip]="getTooltipText()"
      tooltipPosition="bottom"
    />
  `,
  styles: [
    `
      :host {
        margin-right: 16px;
      }
      :host ::ng-deep .p-button {
        padding: 6px;
      }
    `,
  ],
})
export class NotificationComponent {
  unreadCount = signal(0);

  toggleNotificationPanel(event: Event): void {
    // The panel toggle is handled by PrimeNG automatically
  }

  getTooltipText(): string {
    const count = this.unreadCount();
    if (count === 0) {
      return 'No new messages';
    } else if (count === 1) {
      return '1 new message';
    } else {
      return `${count} new messages`;
    }
  }
}
