import { computed, inject, Injectable, signal } from '@angular/core';
import { IUser } from '../models/user.model';
import { IAccount } from '../models/account.model';
import { IOrder } from '../models/entity/order.model';
import { IConnection } from '../models/entity/connection.model';
import { DataAccessService } from './data-access.service';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  readonly user = signal<Partial<IUser> | null>(null);
  readonly selectedLanguage = signal<string>('EN');
  private readonly dataAccessService = inject(DataAccessService);

  readonly locale = computed(() => {
    const map: Record<string, string> = {
      en: 'en-US',
      de: 'de-DE',
      fr: 'fr-FR',
      it: 'it-IT',
    };
    return map[this.selectedLanguage().toLowerCase()] ?? 'en-US';
  });
}
