import { Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../core/services/auth/auth.service';
import { AuthTokenService } from '../../core/services/auth/auth-token.service';
import { Role } from '../../core/constants/role';
import { Button } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { AuthTokenStateService } from '../../core/services/state/auth-token-state.service';
@Component({
  selector: 'app-home',
  imports: [Button, TranslateModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private authService = inject(AuthService);
  private authTokenStateService = inject(AuthTokenStateService);
  authToken = computed(() => this.authTokenStateService.token());
  isAdmin = computed(() => this.authService.hasRole(Role.Admin));

  constructor() {
    // Check for Google OAuth token in URL
    this.route.queryParams.subscribe((params) => {
      const token = params['access_token'];
      if (token) {
        this.authTokenStateService.token.set(token);
        this.location.replaceState(this.router.url.split('?')[0]);
      } else if (!this.authToken()) {
        this.router.navigate(['']);
      }
    });
  }
}
