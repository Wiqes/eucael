import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthTokenStateService {
  token = signal<string | null>(null);
  isRefreshing = signal<boolean>(false);
}
