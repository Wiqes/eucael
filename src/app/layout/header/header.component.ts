import { Component, computed, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ChevronDownIconComponent } from '../../shared/ui/chevron-down-icon.component';
import { LogoComponent } from '../../shared/ui/logo.component';
import { StateService } from '../../core/services/state.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import { UserAvatarComponent } from './user-avatar/user-avatar.component';
import { MenuComponent } from './menu/menu.component';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    ButtonModule,
    ChevronDownIconComponent,
    LogoComponent,
    TranslateModule,
    NgIf,
    UserAvatarComponent,
    MenuComponent,
    MenuModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  private router = inject(Router);
  private stateService = inject(StateService);
  private translate = inject(TranslateService);
  private primeng = inject(PrimeNG);

  photoURL = computed(() => this.stateService.user()?.photoURL || '');
  displayName = computed(() => this.stateService.user()?.fullName || '');
  selectedLanguage = computed(() => this.stateService.selectedLanguage());
  isDataLoading = computed(() => this.stateService.isDataLoading());

  ngOnInit() {
    this.stateService.addBackendDataToState();
  }

  readonly langItems = [
    { label: 'English', command: () => this.onChangeLanguage('EN') },
    { label: 'Deutsch', command: () => this.onChangeLanguage('DE') },
    { label: 'Italiano', command: () => this.onChangeLanguage('IT') },
    { label: 'Français', command: () => this.onChangeLanguage('FR') },
  ];

  onLogoClick(): void {
    this.router.navigate(['/cases']);
  }

  onChangeLanguage(lang: string): void {
    this.translate.use(lang.toLowerCase());
    this.stateService.selectedLanguage.set(lang);
    this.translate.get('primeng').subscribe((res) => {
      this.primeng.setTranslation(res);
    });
  }
}
