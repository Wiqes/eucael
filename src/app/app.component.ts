import { Component, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/ui/toast/toast.component';
import { LanguageService } from './core/services/language.service';
import { LoginService } from './core/services/auth/login.service';
import { AuthService } from './core/services/auth/auth.service';
import { StateService } from './core/services/state.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, ToastComponent, NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private readonly languageService = inject(LanguageService);
  private readonly loginService = inject(LoginService);
  protected readonly authService = inject(AuthService);
  private readonly stateService = inject(StateService);
  isLoggedIn = computed(() => this.loginService.isLoggedIn());
  isDataLoading = computed(() => this.stateService.isDataLoading());

  ngOnInit(): void {
    const element = document.querySelector('html');
    element?.classList.toggle('wiqes-app-dark');

    // Initialize language service
    this.languageService.initializeLanguage();
  }
}
