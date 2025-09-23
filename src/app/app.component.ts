import { Component, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/ui/toast/toast.component';
import { LanguageService } from './core/services/language.service';
import { AuthService } from './core/services/auth/auth.service';
import { StateService } from './core/services/state/state.service';
import { NgClass, NgIf } from '@angular/common';
import { LoaderComponent } from './shared/ui/loader/loader.component';

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
  protected readonly profile = computed(() => this.stateService.profile());
  isLoading = computed(() => this.stateService.isDataLoading() || !this.profile());

  ngOnInit(): void {
    const element = document.querySelector('html');
    element?.classList.toggle('celestiel-app-dark');

    // Initialize language service
    this.languageService.initializeLanguage();
  }
}
