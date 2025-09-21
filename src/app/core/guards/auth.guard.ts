import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthTokenService } from '../services/auth/auth-token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authTokenService = inject(AuthTokenService);
  private router = inject(Router);

  canActivate(): boolean {
    if (!!this.authTokenService.getToken()) {
      return true;
    } else {
      this.router.navigate(['']);
      return false;
    }
  }
}
