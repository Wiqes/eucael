import { computed, inject, Injectable, signal } from '@angular/core';
import { IUser } from '../models/user.model';
import { DataAccessService } from './data-access.service';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  readonly user = signal<Partial<IUser> | null>(null);
  readonly isDataLoading = signal<boolean>(false);
  private readonly dataAccessService = inject(DataAccessService);

  readonly locale = computed(() => {
    const map: Record<string, string> = {
      en: 'en-US',
      es: 'es-ES',
      zh: 'zh-CN',
      hi: 'hi-IN',
      ar: 'ar-SA',
      bn: 'bn-BD',
      pt: 'pt-BR',
      ru: 'ru-RU',
      ja: 'ja-JP',
      pa: 'pa-IN',
      de: 'de-DE',
      fr: 'fr-FR',
      tr: 'tr-TR',
      it: 'it-IT',
      vi: 'vi-VN',
      ta: 'ta-IN',
      ur: 'ur-PK',
      id: 'id-ID',
      sw: 'sw-KE',
      mr: 'mr-IN',
      te: 'te-IN',
      uk: 'uk-UA',
    };
    return map['en'] ?? 'en-US';
  });

  addBackendDataToState() {
    this.isDataLoading.set(true);
    this.dataAccessService.getUserData().subscribe({
      next: this.user.set,
      error: () => this.isDataLoading.set(false),
      complete: () => this.isDataLoading.set(false),
    });
  }
}
