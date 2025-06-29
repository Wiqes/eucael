import { inject, Injectable } from '@angular/core';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loginService = inject(LoginService);
  isLoadingLogin = this.loginService.isLoading;

  login(email: string, password: string) {
    this.loginService.request(email, password);
  }
}
