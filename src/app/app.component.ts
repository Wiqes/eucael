import { Component, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/ui/toast/toast.component';
import { LanguageService } from './core/services/language.service';
import { AuthService } from './core/services/auth/auth.service';
import { StateService } from './core/services/state/state.service';
import { NgClass, NgIf } from '@angular/common';
import { LoaderComponent } from './shared/ui/loader/loader.component';
import { ImagePreloadService } from './core/services/image-preload.service';
import { INITIAL_PRELOADED_IMAGES } from './core/constants/initial-preloaded-images';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, ToastComponent, NgClass, LoaderComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private readonly languageService = inject(LanguageService);
  protected readonly authService = inject(AuthService);
  private readonly stateService = inject(StateService);
  private readonly imagePreloadService = inject(ImagePreloadService);
  protected readonly profile = computed(() => this.stateService.profile());
  private readonly avatarUrl = computed<string>(() => this.stateService.avatarUrl() || '');
  isLoading = computed(() => {
    const isRootRoute = window.location.pathname === '/';
    return this.stateService.isDataLoading() || (!this.profile() && !isRootRoute);
  });

  ngOnInit(): void {
    const element = document.querySelector('html');
    element?.classList.toggle('celestiel-app-dark');

    // Initialize language service
    this.languageService.initializeLanguage();

    // Preload frequently used images
    this.imagePreloadService.preload(INITIAL_PRELOADED_IMAGES).subscribe({
      next: (response) => {
        const successful = Object.values(response).filter(Boolean).length;
        const total = Object.keys(response).length;
        console.log(
          `AppComponent: Image preloading completed - ${successful}/${total} images cached`,
        );
      },
      error: (error) => {
        console.error('AppComponent: Image preloading failed:', error);
      },
    });
  }
}
