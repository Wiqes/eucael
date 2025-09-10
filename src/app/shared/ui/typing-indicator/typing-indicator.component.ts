import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-typing-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="typing-indicator" *ngIf="isVisible">
      <div class="typing-text">
        <span>is typing</span>
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
      .typing-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        color: var(--text-color-secondary);
        background: var(--surface-50);
        border-radius: 1rem;
        margin: 0.5rem 0;
        animation: fadeIn 0.3s ease-in-out;
      }

      .typing-text {
        font-style: italic;
      }

      .typing-dots {
        display: flex;
        gap: 0.2rem;
      }

      .dot {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background-color: var(--text-color-secondary);
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
