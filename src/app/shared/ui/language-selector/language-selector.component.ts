import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { LanguageService } from '../../../core/services/language.service';
import { ChevronDownIconComponent } from '../chevron-down-icon.component';
import { MenuPositioningDirective } from '../menu-positioning.directive';
import { LANGUAGES } from '../../../core/constants/supported-languages';
import { Language } from '../../../core/models/language.model';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [
    CommonModule,
    MenuModule,
    ButtonModule,
    ChevronDownIconComponent,
    MenuPositioningDirective,
  ],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
})
export class LanguageSelectorComponent {
  @ViewChild('langMenu') langMenu!: Menu;
  private readonly languageService = inject(LanguageService);

  selectedLanguage: string = this.languageService.getCurrentLanguage();

  get selectedLanguageObj(): Language | undefined {
    return this.languageService.getLanguageByCode(this.selectedLanguage);
  }

  languageItems: MenuItem[] = LANGUAGES.map((language) => ({
    label: language.name,
    icon: language.flag,
    command: () => this.onLanguageChange(language.code),
  }));

  onLanguageChange(languageCode: string): void {
    this.selectedLanguage = languageCode;
    this.languageService.setLanguage(languageCode);
  }
}
