import { Component, inject, viewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AvatarUploadDialogComponent } from '../../../shared/ui/avatar-upload-dialog/avatar-upload-dialog.component';

@Component({
  selector: 'app-profile-actions',
  imports: [TranslateModule, ButtonModule, AvatarUploadDialogComponent],
  templateUrl: './profile-actions.component.html',
  styleUrl: './profile-actions.component.scss',
})
export class ProfileActionsComponent {
  private messageService = inject(MessageService);

  avatarDialog = viewChild<AvatarUploadDialogComponent>('avatarDialog');

  onEditProfile() {
    // Open the avatar upload dialog
    this.avatarDialog()?.show();
  }

  onAvatarUploadSuccess(message: string) {
    // Handle successful avatar upload
    this.messageService.add({
      severity: 'success',
      summary: 'Profile Updated',
      detail: message,
    });
  }

  onAvatarUploadError(error: string) {
    // Handle avatar upload error
    this.messageService.add({
      severity: 'error',
      summary: 'Upload Error',
      detail: error,
    });
  }
}
