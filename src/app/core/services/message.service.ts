import { inject, Injectable } from '@angular/core';
import { IMessage } from '../models/message.model';
import { MessageService as PrimeNGMessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private messageService = inject(PrimeNGMessageService);
  private translate = inject(TranslateService);

  sendMessage(message: IMessage) {
    const translatedMessage = {
      ...message,
      summary: this.translate.instant(message.summary),
      detail: this.translate.instant(message.detail),
      life: message.life ?? 3000,
    };
    this.messageService.add(translatedMessage);
  }
}
