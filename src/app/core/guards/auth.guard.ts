import { computed, inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthTokenStateService } from '../services/state/auth-token-state.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authTokenStateService = inject(AuthTokenStateService);
  private token = computed(() => this.authTokenStateService.token());
  private router = inject(Router);

  canActivate(): boolean {
    if (!!this.token()) {
      return true;
    } else {
      this.router.navigate(['']);
      return false;
    }
  }
}
