import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-online-status',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  template: `
    <div class="online-status" [class]="getStatusClass()" tooltipPosition="top">
      <div class="status-dot"></div>
    </div>
  `,
  styles: [
    `
      @use 'variables' as *;

      .status-dot {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        transition: background-color 0.3s ease;
      }

      .online .status-dot {
        display: block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 1px solid black;
        transition: all 0.5s ease;
        background: hsla(160, 100%, 80%, 0.9);
        box-shadow: 0 0 15px hsla(160, 100%, 80%, 0.6), 0 0 25px hsla(160, 100%, 80%, 0.3);
      }

      .offline .status-dot {
        display: none;
      }
    `,
  ],
})
export class OnlineStatusComponent {
  @Input() isOnline!: boolean;
  @Input() showAnimation = true;

  getStatusClass(): string {
    const status = this.isOnline ? 'online' : 'offline';
    const animationClass = this.showAnimation ? '' : 'no-animation';

    return `${status} ${animationClass}`.trim();
  }
}
