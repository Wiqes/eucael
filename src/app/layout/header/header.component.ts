import { Component, computed, inject, OnInit, HostListener, signal, effect } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StateService } from '../../core/services/state/state.service';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { UserAvatarComponent } from './user-avatar/user-avatar.component';
import { MenuComponent } from './menu/menu.component';
import { LanguageSelectorComponent } from '../../shared/ui/language-selector/language-selector.component';
import { NotificationComponent } from '../../shared/components/notification/notification.component';
import { ChatService } from '../../core/services/chat.service';
import { AuthTokenService } from '../../core/services/auth/auth-token.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    ButtonModule,
    TranslateModule,
    NgIf,
    NgClass,
    UserAvatarComponent,
    MenuComponent,
    LanguageSelectorComponent,
    NotificationComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  private router = inject(Router);
  private stateService = inject(StateService);
  private chatService = inject(ChatService);
  private authTokenService = inject(AuthTokenService);

  private lastScrollTop = 0;
  private readonly scrollThreshold = 5;
  private readonly headerHeight = 64;

  private isHeaderVisible = signal(true);

  readonly displayName = computed(() => this.stateService.displayName());
  readonly isDataLoading = computed(() => this.stateService.isDataLoading());
  readonly user = computed(() => this.stateService.user());
  readonly isHidden = computed(() => !this.user() || this.isDataLoading());
  readonly headerVisibilityClass = computed(() =>
    this.isHeaderVisible() ? 'header-visible' : 'header-hidden',
  );

  constructor() {
    effect(() => {
      const user = this.user();
      if (user) {
        const token = this.authTokenService.getToken();
        if (token) {
          this.chatService.connect(token);
          this.chatService.subscribeToEvents();
        }
      }
    });
  }

  ngOnInit() {
    this.stateService.addBackendDataToState();
    this.lastScrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;

    if (Math.abs(scrollTop - this.lastScrollTop) < this.scrollThreshold) return;

    if (scrollTop <= this.headerHeight) {
      this.isHeaderVisible.set(true);
    } else {
      this.isHeaderVisible.set(scrollTop < this.lastScrollTop);
    }

    this.lastScrollTop = scrollTop;
  }

  onLogoClick(): void {
    this.router.navigate(['/home']);
  }
}
