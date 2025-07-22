import { computed, inject, Injectable, signal } from '@angular/core';
import { IUser } from '../models/entities/user.model';
import { DataAccessService } from './data-access/data-access.service';
import { IAnimal } from '../models/entities/animal.model';
import { forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  readonly user = signal<Partial<IUser> | null>(null);
  readonly animals = signal<IAnimal[]>([]);
  readonly isDataLoading = signal<boolean>(false);
  private readonly dataAccessService = inject(DataAccessService);
  readonly displayName = computed(() => this.user()?.fullName || this.user()?.username || '');

  addBackendDataToState() {
    if (this.user() || this.isDataLoading()) {
      return;
    }

    this.isDataLoading.set(true);
    forkJoin({
      user: this.dataAccessService.getUserData(),
      animals: this.dataAccessService.getAnimals(),
    }).subscribe({
      next: ({ user, animals }) => {
        this.user.set(user);
        this.animals.set(animals);
      },
      error: () => this.isDataLoading.set(false),
      complete: () => this.isDataLoading.set(false),
    });
  }
}
