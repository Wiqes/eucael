import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StateService } from '../state.service';

@Injectable({
  providedIn: 'root',
})
export class AuthTokenService {
  private router = inject(Router);
  private stateService = inject(StateService);

  isLoggedIn = signal(false);

  logout(): void {
    this.isLoggedIn.set(false);
    try {
      window.localStorage.removeItem('token');
      this.stateService.user.set(null);
      this.router.navigate(['']);
    } catch (e) {
      console.error('Error during logout:', e);
    }
  }
}
