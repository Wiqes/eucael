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
      .online-status {
        position: relative;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }

      .status-dot {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        transition: background-color 0.3s ease;
      }

      .online .status-dot {
        background-color: #4ade80; /* green-400 */
        animation: pulse-online 2s infinite;
      }

      .away .status-dot {
        background-color: #fbbf24; /* amber-400 */
      }

      .offline .status-dot {
        background-color: #6b7280; /* gray-500 */
      }

      @keyframes pulse-online {
        0% {
          box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
        }
        70% {
          box-shadow: 0 0 0 4px rgba(74, 222, 128, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
        }
      }

      /* Size variants */
      .online-status.small {
        width: 8px;
        height: 8px;
        border-width: 1px;
      }

      .online-status.large {
        width: 16px;
        height: 16px;
        border-width: 3px;
      }
    `,
  ],
})
export class OnlineStatusComponent {
  @Input() userId!: string;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showAnimation: boolean = true;

  getStatusClass(): string {
    const status = 'online';
    const sizeClass = this.size !== 'medium' ? this.size : '';
    const animationClass = this.showAnimation ? '' : 'no-animation';

    return `${status} ${sizeClass} ${animationClass}`.trim();
  }
}
