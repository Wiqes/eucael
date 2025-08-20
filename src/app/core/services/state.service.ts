import { computed, inject, Injectable, signal } from '@angular/core';
import { IUser } from '../models/entities/user.model';
import { DataAccessService } from './data-access/data-access.service';
import { IAnimal } from '../models/entities/animal.model';
import { forkJoin } from 'rxjs';
import { DEFAULT_AVATAR_URL } from '../constants/default-values';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  readonly user = signal<Partial<IUser> | null>(null);
  readonly animals = signal<IAnimal[]>([]);
  readonly isDataLoading = signal<boolean>(false);
  private readonly dataAccessService = inject(DataAccessService);
  readonly profile = computed(() => this.user()?.profile);
  readonly avatarUrl = computed(() => this.profile()?.avatarUrl || DEFAULT_AVATAR_URL);
  readonly displayName = computed(() => this.profile()?.name || this.profile()?.email || '');

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

  updateUserProfile(profileUpdates: Partial<IUser['profile']>) {
    const currentUser = this.user();
    if (currentUser && currentUser.profile) {
      const updatedUser = {
        ...currentUser,
        profile: {
          ...currentUser.profile,
          ...profileUpdates,
        },
      };
      this.user.set(updatedUser);
    }
  }
}
