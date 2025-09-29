import { Component, OnInit, computed, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot, RouterOutlet, RouterState } from '@angular/router';
import { ToastComponent } from './shared/ui/toast/toast.component';
import { LanguageService } from './core/services/language.service';
import { AuthService } from './core/services/auth/auth.service';
import { StateService } from './core/services/state/state.service';
import { NgClass, NgIf } from '@angular/common';
import { LoaderComponent } from './shared/ui/loader/loader.component';
import { AuthTokenStateService } from './core/services/state/auth-token-state.service';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

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
  private readonly authTokenStateService = inject(AuthTokenStateService);
  isTokenRefreshing = computed(() => this.authTokenStateService.isRefreshing());
  private readonly stateService = inject(StateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  currentRoute = toSignal(this.route.url);
  private readonly isDataLoading = computed(() => this.stateService.isDataLoading());
  protected readonly profile = computed(() => this.stateService.profile());
  isLoading = computed(() => {
    const isDataLoading = this.isDataLoading();

    const currentRoute = this.router.url;
    const isRootRoute = currentRoute === '/';

    const isEmptyProfile = !this.profile() && !isRootRoute;

    const isTokenRefreshing = this.isTokenRefreshing();
    return isDataLoading || isEmptyProfile || isTokenRefreshing;
  });

  constructor() {
    effect(() => {
      const isLoading = this.isLoading();
      console.log('App is loading:', isLoading);
      const currentRoute = this.router.url;
      console.log('Current route:', currentRoute);
      const snapshot: ActivatedRouteSnapshot = this.route.snapshot;
      const state: RouterState = this.router.routerState;
      console.log('root:', state.snapshot.url);
      const isDataLoading = this.isDataLoading();
      console.log('Is data loading:', isDataLoading);
      const profile = this.profile();
      console.log('Profile:', profile);
    });
  }

  ngOnInit(): void {
    const element = document.querySelector('html');
    element?.classList.toggle('celestiel-app-dark');

    // Initialize language service
    this.languageService.initializeLanguage();
  }
}
