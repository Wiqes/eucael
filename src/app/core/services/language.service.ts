import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNG } from 'primeng/config';
import { LANGUAGES } from '../constants/supported-languages';
import { Language } from '../models/language.model';
import { LOCALE_MAP } from '../constants/locale-map';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly primeng = inject(PrimeNG);
  locale = signal<string>('en-US');

  getCurrentLanguage(): string {
    return this.translate.currentLang || this.translate.defaultLang || 'en';
  }

  getLanguageByCode(code: string): Language | undefined {
    return LANGUAGES.find((lang) => lang.code === code);
  }

  setLanguage(languageCode: string): void {
    const language = this.getLanguageByCode(languageCode);
    if (language) {
      this.translate.use(languageCode);
      localStorage.setItem('selectedLanguage', languageCode);

      this.locale.set(LOCALE_MAP[languageCode] || 'en-US');

      // Update PrimeNG translations
      this.translate.get('primeng').subscribe((res) => {
        this.primeng.setTranslation(res);
      });
    }
  }

  initializeLanguage(): void {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    const browserLanguage = navigator.language.substring(0, 2);

    let languageToUse = 'en'; // default

    if (savedLanguage && this.getLanguageByCode(savedLanguage)) {
      languageToUse = savedLanguage;
    } else if (this.getLanguageByCode(browserLanguage)) {
      languageToUse = browserLanguage;
    }

    this.setLanguage(languageToUse);
  }
}
