import { inject, Injectable } from '@angular/core';
import { IMessage } from '../models/message.model';
import { MessageService as PrimeNGMessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private messageService = inject(PrimeNGMessageService);

  sendMessage(message: IMessage) {
    this.messageService.add({ ...message, life: message.life ?? 3000 });
  }
}
