import { inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../message.service';
import { environment } from '../../../../environments/environment';
import { ICredentials } from '../../models/credentials.model';

export abstract class AuthBaseService {
  protected http = inject(HttpClient);
  protected messageService = inject(MessageService);
  isLoading = signal(false);

  abstract request(credentials: ICredentials): void;

  protected makeAuthRequest(
    endpoint: string,
    payload: any,
    onSuccess: (response: any) => void,
    onError: () => void,
  ): void {
    this.isLoading.set(true);

    this.http.post<any>(`${environment.API_URL}${endpoint}`, payload).subscribe({
      next: (response) => {
        onSuccess(response);
        this.isLoading.set(false);
      },
      error: () => {
        onError();
        this.isLoading.set(false);
      },
    });
  }

  protected handleSuccess(message: any, callback?: () => void): void {
    this.messageService.sendMessage(message);
    if (callback) {
      callback();
    }
  }

  protected handleError(message: any): void {
    this.messageService.sendMessage(message);
  }
}
