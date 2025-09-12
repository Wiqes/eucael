import { Component, computed, input } from '@angular/core';
import { ChatAvatarComponent } from '../../../shared/ui/chat-avatar/chat-avatar.component';
import { TypingIndicatorComponent } from '../../../shared/ui/typing-indicator/typing-indicator.component';
import { OnlineStatusComponent } from '../../../shared/ui/online-status/online-status.component';
import { IProfile } from '../../../core/models/entities/profile.model';

@Component({
  selector: 'app-chat-header',
  imports: [ChatAvatarComponent, TypingIndicatorComponent, OnlineStatusComponent],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss',
})
export class ChatHeaderComponent {
  isTyping = input<boolean>(false);
  isOnline = input<boolean>(false);
  interlocutorProfile = input<IProfile | null>(null);
  interlocutorName = computed(
    () => this.interlocutorProfile()?.name || this.interlocutorProfile()?.email || 'Unknown',
  );
}
