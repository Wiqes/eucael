import { Component, computed, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { StateService } from '../../core/services/state.service';
import { LanguageService } from '../../core/services/language.service';
import { ProfileService } from '../../core/services/profile.service';
import { ProfileHeaderComponent } from './profile-header/profile-header.component';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { FormControlComponent } from '../../shared/ui/form-control/form-control.component';
import { MessageService } from '../../core/services/message.service';
import { MESSAGES } from '../../core/constants/messages';
import { InfoItemComponent } from './info-item/info-item.component';

@Component({
  selector: 'app-profile',
  imports: [
    TranslateModule,
    ProfileHeaderComponent,
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    FormControlComponent,
    InfoItemComponent,
    ToastModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private stateService = inject(StateService);
  private languageService = inject(LanguageService);
  private profileService = inject(ProfileService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  isDialogVisible = signal(false);
  isUpdating = signal(false);

  editProfileForm: FormGroup;
  formControls: { [key: string]: FormControl };

  displayName = computed(() => this.stateService.displayName());
  email = computed(() => this.stateService.profile()?.email || '');
  country = computed(() => this.stateService.profile()?.country || '');
  isDataLoading = computed(() => this.stateService.isDataLoading());
  locale = computed(() => this.languageService.locale());

  registrationDate = computed(() => {
    const date = new Date(this.stateService.user()?.createdAt || '');
    return isNaN(date.getTime()) ? '' : date;
  });

  formattedRegistrationDate = computed(() => {
    const date = this.registrationDate();
    const locale = this.locale();
    if (!date) return '';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  });

  constructor() {
    this.editProfileForm = this.fb.group({
      name: ['', [Validators.required]],
      country: ['', [Validators.required]],
    });

    this.formControls = {
      name: this.editProfileForm.get('name') as FormControl,
      country: this.editProfileForm.get('country') as FormControl,
    };
  }

  openEditMode(): void {
    this.isDialogVisible.set(true);
    // Pre-fill the form with current values
    this.editProfileForm.patchValue({
      name: this.displayName(),
      country: this.country() || 'Unknown',
    });
  }

  cancelEdit(): void {
    this.isDialogVisible.set(false);
    this.editProfileForm.reset();
  }

  onDialogHide(): void {
    this.isDialogVisible.set(false);
    this.editProfileForm.reset();
  }

  onVisibleChange(event: boolean) {
    this.isDialogVisible.set(event);
  }

  onSubmit(): void {
    if (this.editProfileForm.invalid) {
      // Mark all form controls as touched to display validation errors
      this.editProfileForm.markAllAsTouched();
      return;
    }

    if (!this.isUpdating()) {
      this.isUpdating.set(true);

      const updateData = this.editProfileForm.value;

      this.profileService.updateProfile(updateData).subscribe({
        next: (updatedProfile) => {
          // Update the state with the new profile data
          this.stateService.updateUserProfile(updatedProfile);
          this.messageService.sendMessage(MESSAGES.PROFILE_UPDATE_SUCCESS);
          this.isDialogVisible.set(false);
          this.isUpdating.set(false);
        },
        error: (error) => {
          this.messageService.sendMessage(MESSAGES.PROFILE_UPDATE_FAILED);
          this.isUpdating.set(false);
        },
      });
    }
  }
}
