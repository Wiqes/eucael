import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { MessageService } from '../../core/services/message.service';
import { MESSAGES } from '../../core/constants/messages';

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
          this.messageService.sendMessage(MESSAGES.STORAGE_ERROR);
        }
        this.messageService.sendMessage(MESSAGES.LOGIN_SUCCESS);
        // Remove token from URL for cleanliness
        this.location.replaceState(this.router.url.split('?')[0]);
      }
    });
  }

  onCreateCase() {
    this.router.navigate(['/case-creation']);
  }
}
