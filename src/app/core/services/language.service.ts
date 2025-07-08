import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNG } from 'primeng/config';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly primeng = inject(PrimeNG);

  readonly supportedLanguages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  ];

  getCurrentLanguage(): string {
    return this.translate.currentLang || this.translate.defaultLang || 'en';
  }

  getLanguageByCode(code: string): Language | undefined {
    return this.supportedLanguages.find((lang) => lang.code === code);
  }

  setLanguage(languageCode: string): void {
    const language = this.getLanguageByCode(languageCode);
    if (language) {
      this.translate.use(languageCode);
      localStorage.setItem('selectedLanguage', languageCode);

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
