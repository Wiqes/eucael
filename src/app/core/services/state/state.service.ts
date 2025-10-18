import { computed, inject, Injectable, signal } from '@angular/core';
import { IUser } from '../../models/entities/user.model';
import { DataAccessService } from '../data-access/data-access.service';
import { IAnimal } from '../../models/entities/animal.model';
import { IProfile } from '../../models/entities/profile.model';
import { AuthTokenStateService } from './auth-token-state.service';
import { Base64Service } from '../base64.service';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private readonly dataAccessService = inject(DataAccessService);
  private readonly authTokenStateService = inject(AuthTokenStateService);
  private readonly base64Service = inject(Base64Service);
  readonly token = computed(() => this.authTokenStateService.token());
  readonly user = signal<Partial<IUser> | null>(null);
  readonly animals = signal<IAnimal[]>([]);
  readonly isDataLoading = signal<boolean>(false);
  readonly tokenAvatarUrl = signal<string | null>(null);
  readonly profile = computed(() => this.user()?.profile);
  readonly avatarUrl = computed(() => this.user()?.avatarUrl || this.tokenAvatarUrl() || '');
  readonly displayName = computed(() => this.profile()?.name || this.profile()?.email || '');

  setProfileFromToken(token: string): void {
    if (token) {
      const payload = JSON.parse(this.base64Service.decode(token.split('.')[1]));
      this.tokenAvatarUrl.set(payload?.avatarUrl || null);
    }
  }

  addAnimalsDataToState(animalsData: IAnimal[] = []): void {
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

  updateUserAvatar(avatarUrl: string) {
    const currentUser = this.user();
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        avatarUrl,
      };
      this.user.set(updatedUser);
    }
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
