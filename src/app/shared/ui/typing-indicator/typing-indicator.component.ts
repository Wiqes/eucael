import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-typing-indicator',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="typing-indicator" *ngIf="isVisible">
      <div class="typing-text">
        <span>{{ 'is typing' | translate }}</span>
      </div>
      <div class="typing-dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>
  `,
  styles: [
    `
      @use 'variables' as *;

      .typing-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: $primary-color-light;
        border-radius: 1rem;
        animation: fadeIn 0.3s ease-in-out;
      }

      .typing-text {
        font-style: italic;
      }

      .typing-dots {
        display: flex;
        gap: 0.2rem;
        position: relative;
        top: 4px;
        left: -2px;
      }

      .dot {
        width: 2px;
        height: 2px;
        border-radius: 50%;
        background-color: $primary-color-light;
        animation: pulse 1.4s infinite ease-in-out;
      }

      .dot:nth-child(1) {
        animation-delay: -0.32s;
      }

      .dot:nth-child(2) {
        animation-delay: -0.16s;
      }

      @keyframes pulse {
        0%,
        80%,
        100% {
          transform: scale(0.5);
          opacity: 0.3;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class TypingIndicatorComponent {
  @Input() isVisible: boolean = false;
}
