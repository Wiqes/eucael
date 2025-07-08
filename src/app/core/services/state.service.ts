import { computed, inject, Injectable, signal } from '@angular/core';
import { IUser } from '../models/user.model';
import { DataAccessService } from './data-access.service';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  readonly user = signal<Partial<IUser> | null>(null);
  readonly isDataLoading = signal<boolean>(false);
  private readonly dataAccessService = inject(DataAccessService);

  addBackendDataToState() {
    this.isDataLoading.set(true);
    this.dataAccessService.getUserData().subscribe({
      next: this.user.set,
      error: () => this.isDataLoading.set(false),
      complete: () => this.isDataLoading.set(false),
    });
  }
}
