import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-scroll-to-bottom-button',
  standalone: true,
  imports: [CommonModule, ButtonModule, RippleModule],
  templateUrl: './scroll-to-bottom-button.component.html',
  styleUrls: ['./scroll-to-bottom-button.component.scss'],
})
export class ScrollToBottomButtonComponent {
  visible = input(false);
  scrollToBottom = output<void>();

  onScrollClick(): void {
    this.scrollToBottom.emit();
  }
}
