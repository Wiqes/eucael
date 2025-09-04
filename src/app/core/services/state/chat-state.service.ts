import { computed, inject, Injectable } from '@angular/core';
import { StateService } from './state.service';
import { IChat } from '../../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatStateService {
  private readonly stateService = inject(StateService);
  chats = computed<IChat[]>(() => {
    const chatsAsParticipant1 = this.stateService.user()?.chatsAsParticipant1 || [];
    const chatsAsParticipant2 = this.stateService.user()?.chatsAsParticipant2 || [];
    return [...chatsAsParticipant1, ...chatsAsParticipant2];
  });
}
