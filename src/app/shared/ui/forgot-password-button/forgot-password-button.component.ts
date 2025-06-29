import { Component, computed, inject, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PasswordResetService } from '../../../core/services/auth/password-reset.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { MESSAGES } from '../../../core/constants/messages';
import { MessageService } from '../../../core/services/message.service';

@Component({
  selector: 'app-forgot-password-button',
  imports: [ButtonModule],
  templateUrl: './forgot-password-button.component.html',
  styleUrl: './forgot-password-button.component.scss',
})
export class ForgotPasswordButtonComponent {
  email = input<string | null>(null);
  isValidEmail = input<boolean>(true);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  isResetPasswordRequested = computed(() => this.authService.isResetPasswordRequested());

  onForgotPassword() {
    if (!this.isValidEmail()) {
      this.messageService.sendMessage(MESSAGES.INVALID_EMAIL);
      return;
    }
    this.authService.sendPasswordResetRequest(this.email() || '');
  }
}
