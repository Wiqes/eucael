import { Component, computed, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { StateService } from '../../core/services/state.service';
import { LanguageService } from '../../core/services/language.service';
import { ProfileHeaderComponent } from './profile-header/profile-header.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [TranslateModule, ProfileHeaderComponent, NgIf],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private stateService = inject(StateService);
  private languageService = inject(LanguageService);

  displayName = computed(() => this.stateService.displayName());
  email = computed(() => this.stateService.profile()?.email || '');
  country = computed(() => this.stateService.profile()?.country || '');
  isDataLoading = computed(() => this.stateService.isDataLoading());
  locale = computed(() => this.languageService.locale());
  registrationDate = computed(() => {
    const date = new Date(this.stateService.user()?.createdAt || '');
    return isNaN(date.getTime()) ? '' : date;
  });
  formattedRegistrationDate = computed(() => {
    const date = this.registrationDate();
    const locale = this.locale();
    if (!date) return '';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  });
}
