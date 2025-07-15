import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { Role } from '../constants/role';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    if (!!this.authService.authToken() && this.authService.hasRole(Role.Admin)) {
      return true;
    } else {
      this.router.navigate(['']);
      return false;
    }
  }
}
