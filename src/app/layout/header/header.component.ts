import { Component, computed, inject, OnDestroy } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { ChevronDownIconComponent } from '../../shared/ui/chevron-down-icon.component';
import { LogoComponent } from '../../shared/ui/logo.component';
import { StateService } from '../../core/services/state.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SkeletonModule } from 'primeng/skeleton';
import { NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { PrimeNG } from 'primeng/config';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    ButtonModule,
    AvatarModule,
    MenuModule,
    ChevronDownIconComponent,
    LogoComponent,
    SkeletonModule,
    TranslateModule,
    NgIf,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnDestroy {
  private langChangeSub: Subscription;
  private router = inject(Router);
  private stateService = inject(StateService);
  private translate = inject(TranslateService);
  private primeng = inject(PrimeNG);

  photoURL = computed(() => this.stateService.user()?.photoURL || '');
  displayName = computed(() => this.stateService.user()?.displayName || '');
  selectedLanguage = computed(() => this.stateService.selectedLanguage());

  items: any[] = [];

  constructor() {
    this.setMenuItems();
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.setMenuItems();
    });
  }

  private setMenuItems() {
    this.items = [
      {
        icon: 'pi pi-user',
        label: this.translate.instant('My Profile'),
        command: () => this.onProfile(),
      },
      {
        icon: 'pi pi-sign-out',
        label: this.translate.instant('Log out'),
        command: () => this.logout(),
      },
    ];
  }

  readonly langItems = [
    { label: 'English', command: () => this.onChangeLanguage('EN') },
    { label: 'Deutsch', command: () => this.onChangeLanguage('DE') },
    { label: 'Italiano', command: () => this.onChangeLanguage('IT') },
    { label: 'Français', command: () => this.onChangeLanguage('FR') },
  ];

  onProfile(): void {
    this.router.navigate(['/profile']);
  }

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

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    this.langChangeSub.unsubscribe();
  }
}
