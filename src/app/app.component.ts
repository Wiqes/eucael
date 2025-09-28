import { Component, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/ui/toast/toast.component';
import { LanguageService } from './core/services/language.service';
import { AuthService } from './core/services/auth/auth.service';
import { StateService } from './core/services/state/state.service';
import { NgClass, NgIf } from '@angular/common';
import { LoaderComponent } from './shared/ui/loader/loader.component';
import { AuthTokenStateService } from './core/services/state/auth-token-state.service';

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
  private readonly isDataLoading = computed(() => this.stateService.isDataLoading());
  protected readonly profile = computed(() => this.stateService.profile());
  isLoading = computed(() => {
    const isDataLoading = this.isDataLoading();

    const isRootRoute = window.location.pathname === '/';
    const isEmptyProfile = !this.profile() && !isRootRoute;

    const isTokenRefreshing = this.isTokenRefreshing();
    return isDataLoading || isEmptyProfile || isTokenRefreshing;
  });

  ngOnInit(): void {
    const element = document.querySelector('html');
    element?.classList.toggle('celestiel-app-dark');

    // Initialize language service
    this.languageService.initializeLanguage();
  }
}
