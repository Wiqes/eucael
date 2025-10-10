import { inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../message.service';
import { environment } from '../../../../environments/environment';
import { ICredentials } from '../../models/credentials.model';
import { IMessage } from '../../models/message.model';

export abstract class AuthBaseService {
  protected http = inject(HttpClient);
  protected messageService = inject(MessageService);
  isLoading = signal(false);

  abstract request(credentials: ICredentials): void;

  protected makeAuthRequest<T = Record<string, unknown>>(
    endpoint: string,
    payload: Record<string, unknown>,
    onSuccess: (response: T) => void,
    onError: () => void,
    isRegularLoading = true,
  ): void {
    this.isLoading.set(true);

    this.http.post<T>(`${environment.API_URL}${endpoint}`, payload).subscribe({
      next: (response) => {
        onSuccess(response);
        if (isRegularLoading) {
          this.isLoading.set(false);
        }
      },
      error: () => {
        onError();
        this.isLoading.set(false);
      },
    });
  }

  protected handleSuccess(message: IMessage | null, callback?: () => void): void {
    if (message) {
      this.messageService.sendMessage(message);
    }
    if (callback) {
      callback();
    }
  }

  protected handleError(message: IMessage): void {
    if (message) {
      this.messageService.sendMessage(message);
    }
  }
}
