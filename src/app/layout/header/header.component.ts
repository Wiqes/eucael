import {
  Component,
  computed,
  inject,
  OnDestroy,
  AfterViewInit,
  Renderer2,
  signal,
  effect,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StateService } from '../../core/services/state/state.service';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { MenuComponent } from '../../shared/ui/menu/menu.component';
import { LanguageSelectorComponent } from '../../shared/ui/language-selector/language-selector.component';
import { ChatService } from '../../core/services/chat/chat.service';
import { AuthTokenStateService } from '../../core/services/state/auth-token-state.service';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    ButtonModule,
    TranslateModule,
    NgIf,
    NgClass,
    MenuComponent,
    LanguageSelectorComponent,
    ProgressBarModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements AfterViewInit, OnDestroy {
  private router = inject(Router);
  private stateService = inject(StateService);
  private authTokenStateService = inject(AuthTokenStateService);
  private chatService = inject(ChatService);
  private renderer = inject(Renderer2);

  private lastScrollTop = 0;
  private readonly scrollThreshold = 5;
  private readonly headerHeight = 64;
  private scrollUnlisten?: () => void;

  private isHeaderVisible = signal(true);

  readonly displayName = computed(() => this.stateService.displayName());
  readonly isDataLoading = computed(() => this.stateService.isDataLoading());
  readonly isHidden = computed(() => this.isDataLoading() || !this.displayName());
  readonly headerVisibilityClass = computed(() =>
    this.isHeaderVisible() ? 'header-visible' : 'header-hidden',
  );
  readonly token = computed(() => this.authTokenStateService.token());

  constructor() {
    effect(() => {
      const token = this.token();
      if (token) {
        this.chatService.connect(token);
        this.stateService.setProfileFromToken(token);
      }
    });
  }

  ngAfterViewInit() {
    // Simple timeout to let Angular finish rendering
    setTimeout(() => {
      this.setupMainContentScrollListener();
    }, 0);
  }

  ngOnDestroy() {
    if (this.scrollUnlisten) {
      this.scrollUnlisten();
    }
  }

  private setupMainContentScrollListener(): void {
    const mainContentElement = document.querySelector('.main-content') as HTMLElement;

    if (mainContentElement) {
      // Initialize scroll position
      this.lastScrollTop = mainContentElement.scrollTop;

      // Add scroll event listener
      this.scrollUnlisten = this.renderer.listen(mainContentElement, 'scroll', (event) => {
        this.onMainContentScroll(event.target as HTMLElement);
      });
    } else {
      // Retry if element not found
      setTimeout(() => this.setupMainContentScrollListener(), 300);
    }
  }

  private onMainContentScroll(element: HTMLElement): void {
    const scrollTop = element.scrollTop;

    // Apply threshold to prevent excessive updates
    if (Math.abs(scrollTop - this.lastScrollTop) < this.scrollThreshold) {
      return;
    }

    // Show header when at top or scrolling up, hide when scrolling down past header height
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
