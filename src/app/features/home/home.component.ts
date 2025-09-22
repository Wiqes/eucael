import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { Role } from '../../core/constants/role';
import { Button } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  imports: [Button, TranslateModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  isAdmin = computed(() => this.authService.hasRole(Role.Admin));
}
