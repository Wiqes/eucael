import { computed, inject, Injectable, signal } from '@angular/core';
import { IUser } from '../models/user.model';
import { DataAccessService } from './data-access.service';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  readonly user = signal<Partial<IUser> | null>(null);
  readonly selectedLanguage = signal<string>('EN');
  readonly isDataLoading = signal<boolean>(false);
  private readonly dataAccessService = inject(DataAccessService);

  readonly locale = computed(() => {
    const map: Record<string, string> = {
      en: 'en-US',
      de: 'de-DE',
      fr: 'fr-FR',
      it: 'it-IT',
      es: 'es-ES',
      pt: 'pt-PT',
      ru: 'ru-RU',
    };
    return map[this.selectedLanguage().toLowerCase()] ?? 'en-US';
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
