import { Component, computed, inject } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { AvatarModule } from 'primeng/avatar';
import { NgIf } from '@angular/common';
import { StateService } from '../../../core/services/state/state.service';
import { OwlIconComponent } from '../../../shared/ui/icons/owl-icon/owl-icon.component';

@Component({
  selector: 'app-user-avatar',
  imports: [SkeletonModule, AvatarModule, NgIf, OwlIconComponent],
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss',
})
export class UserAvatarComponent {
  private stateService = inject(StateService);
  photoURL = computed(() => this.stateService.avatarUrl());
  isDataLoading = computed(() => this.stateService.isDataLoading());
}
