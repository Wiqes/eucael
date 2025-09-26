import { computed, inject, Injectable, signal } from '@angular/core';
import { IUser } from '../../models/entities/user.model';
import { DataAccessService } from '../data-access/data-access.service';
import { IAnimal } from '../../models/entities/animal.model';
import { IProfile } from '../../models/entities/profile.model';
import { AuthTokenStateService } from './auth-token-state.service';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private readonly dataAccessService = inject(DataAccessService);
  private readonly authTokenStateService = inject(AuthTokenStateService);
  readonly token = computed(() => this.authTokenStateService.token());
  readonly user = signal<Partial<IUser> | null>(null);
  readonly animals = signal<IAnimal[]>([]);
  readonly isDataLoading = signal<boolean>(false);
  readonly tokenProfile = signal<IProfile | null>(null);
  readonly profile = computed(() => this.user()?.profile || this.tokenProfile());
  readonly avatarUrl = computed(() => this.profile()?.avatarUrl || null);
  readonly displayName = computed(() => this.profile()?.name || this.profile()?.email || '');

  setProfileFromToken(token: string): void {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.tokenProfile.set(payload.profile || null);
    }
  }

  addAnimalsDataToState(animalsData: IAnimal[] = []): void {
    if (animalsData.length || this.isDataLoading()) {
      return;
    }
    this.animals.set(animalsData);
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
