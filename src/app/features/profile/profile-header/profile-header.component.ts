import { Component, computed, inject } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { StateService } from '../../../core/services/state/state.service';
import { ProfileActionsComponent } from '../profile-actions/profile-actions.component';

@Component({
  selector: 'app-profile-header',
  imports: [AvatarModule, ProfileActionsComponent],
  templateUrl: './profile-header.component.html',
  styleUrl: './profile-header.component.scss',
})
export class ProfileHeaderComponent {
  private stateService = inject(StateService);
  photoURL = computed(() => this.stateService.avatarUrl());
  displayName = computed(() => this.stateService.displayName());
  country = computed(() => this.stateService.profile()?.country || '');
}
