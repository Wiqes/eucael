import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TranslateModule } from '@ngx-translate/core';
import { IChatMessage } from '../../../core/models/chat.model';

@Component({
  selector: 'app-message-delete-button',
  standalone: true,
  imports: [CommonModule, ButtonModule, RippleModule, TranslateModule],
  templateUrl: './message-delete-button.component.html',
  styleUrls: ['./message-delete-button.component.scss'],
})
export class MessageDeleteButtonComponent {
  @Input({ required: true }) message!: IChatMessage;
  @Input({ required: true }) currentUserId!: string | number;
  @Output() deleteMessage = new EventEmitter<{ event: Event; message: IChatMessage }>();

  onDelete(event: Event): void {
    this.deleteMessage.emit({ event, message: this.message });
  }
}
