import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    if (!!this.authService.getStoredToken()) {
      return true;
    } else {
      this.router.navigate(['']);
      return false;
    }
  }
}
