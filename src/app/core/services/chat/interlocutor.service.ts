import { Injectable, signal } from '@angular/core';
import { IParticipant } from '../../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class InterlocutorService {
  interlocutor = signal<IParticipant | null>(null);

  changeOnlineStatus(userId: string, isOnline: boolean): void {
    const current = this.interlocutor();
    if (current && current.id === userId) {
      this.interlocutor.set({ ...current, isOnline });
    }
  }
}
