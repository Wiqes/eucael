import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../core/services/message.service';
import { MESSAGES } from '../../core/constants/messages';
import { Location } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
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
}
