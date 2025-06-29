import { Injectable } from '@angular/core';
import { MESSAGES } from '../../constants/messages';
import { ICredentials } from '../../models/credentials.model';
import { AuthBaseService } from './auth-base.service';

@Injectable({
  providedIn: 'root',
})
export class PasswordResetService extends AuthBaseService {
  request({ email }: ICredentials) {
    this.makeAuthRequest(
      '/auth/request-password-reset',
      { username: email },
      () => this.handleSuccess(MESSAGES.FORGOT_PASSWORD_INFO),
      () => this.handleError(MESSAGES.FORGOT_PASSWORD_ERROR),
    );
  }
}
