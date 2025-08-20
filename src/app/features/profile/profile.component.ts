import { Component, computed, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { StateService } from '../../core/services/state.service';
import { ProfileHeaderComponent } from './profile-header/profile-header.component';
import { DatePipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [TranslateModule, ProfileHeaderComponent, NgIf, DatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private stateService = inject(StateService);
  displayName = computed(() => this.stateService.displayName());
  email = computed(() => this.stateService.profile()?.email || '');
  country = computed(() => this.stateService.profile()?.country || '');
  isDataLoading = computed(() => this.stateService.isDataLoading());
  registrationDate = computed(() => {
    const date = new Date(this.stateService.user()?.createdAt || '');
    return isNaN(date.getTime()) ? '' : date;
  });
}
