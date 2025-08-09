import {
  Component,
  computed,
  inject,
  OnInit,
  OnDestroy,
  HostListener,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { LogoComponent } from '../../shared/ui/logo.component';
import { StateService } from '../../core/services/state.service';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf, NgClass } from '@angular/common';
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
    NgClass,
    UserAvatarComponent,
    MenuComponent,
    LanguageSelectorComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private stateService = inject(StateService);

  // Scroll-related properties
  private lastScrollTop = 0;
  private scrollThreshold = 5; // Minimum scroll distance to trigger hide/show
  private headerHeight = 64; // Header height in pixels

  // Signals for reactive state
  private isHeaderVisible = signal(true);

  photoURL = computed(() => this.stateService.user()?.photoURL || '');
  displayName = computed(() => this.stateService.displayName());
  isDataLoading = computed(() => this.stateService.isDataLoading());
  user = computed(() => this.stateService.user());
  isHidden = computed(() => !this.user() || this.isDataLoading());

  // Computed property for header visibility class
  headerVisibilityClass = computed(() =>
    this.isHeaderVisible() ? 'header-visible' : 'header-hidden',
  );

  ngOnInit() {
    this.stateService.addBackendDataToState();
    // Initialize scroll position
    this.lastScrollTop =
      window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  ngOnDestroy() {
    // Cleanup if needed (currently no subscriptions to clean up)
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    const scrollTop =
      window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    // Only process scroll if we've moved more than the threshold
    if (Math.abs(scrollTop - this.lastScrollTop) < this.scrollThreshold) {
      return;
    }

    // If at the top of the page, always show header
    if (scrollTop <= this.headerHeight) {
      this.isHeaderVisible.set(true);
    } else {
      // Scrolling down - hide header
      if (scrollTop > this.lastScrollTop) {
        this.isHeaderVisible.set(false);
      }
      // Scrolling up - show header
      else {
        this.isHeaderVisible.set(true);
      }
    }

    this.lastScrollTop = scrollTop;
  }

  onLogoClick(): void {
    this.router.navigate(['/home']);
  }
}
