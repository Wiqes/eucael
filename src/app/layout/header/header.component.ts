import { Component, computed, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { LogoComponent } from '../../shared/ui/logo.component';
import { StateService } from '../../core/services/state.service';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { UserAvatarComponent } from './user-avatar/user-avatar.component';
import { MenuComponent } from './menu/menu.component';
import { LanguageSelectorComponent } from '../../shared/ui/language-selector/language-selector.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    ButtonModule,
    LogoComponent,
    TranslateModule,
    NgIf,
    UserAvatarComponent,
    MenuComponent,
    LanguageSelectorComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  private router = inject(Router);
  private stateService = inject(StateService);

  photoURL = computed(() => this.stateService.user()?.photoURL || '');
  displayName = computed(() => this.stateService.user()?.fullName || '');
  selectedLanguage = computed(() => this.stateService.selectedLanguage());
  isDataLoading = computed(() => this.stateService.isDataLoading());

  ngOnInit() {
    this.stateService.addBackendDataToState();
  }

  onLogoClick(): void {
    this.router.navigate(['/cases']);
  }
}
