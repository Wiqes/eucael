import { Component, computed, inject } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { AvatarModule } from 'primeng/avatar';
import { NgIf } from '@angular/common';
import { StateService } from '../../../core/services/state.service';

@Component({
  selector: 'app-user-avatar',
  imports: [SkeletonModule, AvatarModule, NgIf],
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss',
})
export class UserAvatarComponent {
  private stateService = inject(StateService);
  photoURL = computed(() => this.stateService.avatarUrl());
  isDataLoading = computed(() => this.stateService.isDataLoading());
}
