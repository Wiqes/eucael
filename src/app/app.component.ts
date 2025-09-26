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
  isLoading = computed(() => {
    const isRootRoute = window.location.pathname === '/';
    return this.stateService.isDataLoading() || (!this.profile() && !isRootRoute);
  });

  ngOnInit(): void {
    const element = document.querySelector('html');
    element?.classList.toggle('celestiel-app-dark');

    // Initialize language service
    this.languageService.initializeLanguage();

    // Preload frequently used images (add or adjust list as needed)
    this.imagePreloadService
      .preload([
        'https://wiqes-images.s3.us-east-1.amazonaws.com/1861a428-80cc-4205-bf49-1f5d9a89a1a6-female.jpg',
        '/assets/images/logo.png',
        '/assets/images/logo-512.png',
        '/assets/background.jpg',
        '/assets/images/panther.jpg',
      ])
      .subscribe((result) => console.log('[ImagePreload] results', result));
  }
}
