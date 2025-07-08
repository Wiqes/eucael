import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { LanguageService, Language } from '../../../core/services/language.service';
import { ChevronDownIconComponent } from '../chevron-down-icon.component';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, MenuModule, ButtonModule, ChevronDownIconComponent],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
})
export class LanguageSelectorComponent {
  private readonly languageService = inject(LanguageService);

  readonly languages: Language[] = this.languageService.supportedLanguages;
  selectedLanguage: string = this.languageService.getCurrentLanguage();

  get selectedLanguageObj(): Language | undefined {
    return this.languageService.getLanguageByCode(this.selectedLanguage);
  }

  languageItems: MenuItem[] = this.languages.map((language) => ({
    label: language.name,
    command: () => this.onLanguageChange(language.code),
  }));

  onLanguageChange(languageCode: string): void {
    this.selectedLanguage = languageCode;
    this.languageService.setLanguage(languageCode);
  }
}
