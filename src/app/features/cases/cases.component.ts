import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-cases',
  standalone: true,
  imports: [ButtonModule, TranslateModule],
  templateUrl: './cases.component.html',
  styleUrl: './cases.component.scss',
})
export class CasesComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private messageService = inject(MessageService);
  cases = [];

  constructor() {
    // Check for Google OAuth token in URL
    this.route.queryParams.subscribe((params) => {
      const token = params['access_token'];
      if (token) {
        try {
          window.localStorage.setItem('token', token);
        } catch (e) {
          this.messageService.add({
            severity: 'error',
            summary: 'Storage Error',
            detail: 'Unable to save token. Please check your browser settings.',
          });
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Login Successful',
          detail: 'Welcome! You are now logged in with Google.',
        });
        // Remove token from URL for cleanliness
        this.location.replaceState(this.router.url.split('?')[0]);
      }
    });
  }

  onCreateCase() {
    this.router.navigate(['/case-creation']);
  }
}
