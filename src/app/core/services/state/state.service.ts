import { computed, inject, Injectable, signal } from '@angular/core';
import { IUser } from '../../models/entities/user.model';
import { DataAccessService } from '../data-access/data-access.service';
import { IAnimal } from '../../models/entities/animal.model';
import { DEFAULT_AVATAR_URL } from '../../constants/default-values';
import { IProfile } from '../../models/entities/profile.model';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private readonly dataAccessService = inject(DataAccessService);
  readonly user = signal<Partial<IUser> | null>(null);
  readonly animals = signal<IAnimal[]>([]);
  readonly isDataLoading = signal<boolean>(false);
  readonly profile = computed(() => this.user()?.profile || this.getProfileFromToken());
  readonly avatarUrl = computed(() => this.profile()?.avatarUrl || DEFAULT_AVATAR_URL);
  readonly displayName = computed(() => this.profile()?.name || this.profile()?.email || '');

  private getProfileFromToken(): IProfile | null {
    const token = window.localStorage.getItem('token');
    if (!token) {
      return null;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));

    return payload.profile || null;
  }

  addAnimalsDataToState() {
    if (this.animals()?.length || this.isDataLoading()) {
      return;
    }

    this.isDataLoading.set(true);
    this.dataAccessService.getAnimals().subscribe({
      next: (animals) => {
        this.animals.set(animals);
      },
      error: () => this.isDataLoading.set(false),
      complete: () => this.isDataLoading.set(false),
    });
  }

  addUserDataToState() {
    if (this.user() || this.isDataLoading()) {
      return;
    }

    this.isDataLoading.set(true);
    this.dataAccessService.getUserData().subscribe({
      next: (user) => {
        this.user.set(user);
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
