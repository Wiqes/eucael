import { Component, computed, inject } from '@angular/core';
import { ChatStateService } from '../../core/services/state/chat-state.service';
import { NgFor } from '@angular/common';
import { IParticipant } from '../../core/models/chat.model';

@Component({
  selector: 'app-messages',
  imports: [NgFor],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
})
export class MessagesComponent {
  private chatStateService = inject(ChatStateService);
  interlocutors = computed<IParticipant[]>(() =>
    this.chatStateService.chats().map(
      (chat) =>
        ({
          chatId: chat.id,
          profile: chat.participant2?.profile || chat.participant2?.profile || null,
        } as IParticipant),
    ),
  );
}
