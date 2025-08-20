import { Component, inject, viewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { AvatarUploadDialogComponent } from '../../../shared/ui/avatar-upload-dialog/avatar-upload-dialog.component';

@Component({
  selector: 'app-profile-actions',
  imports: [TranslateModule, ButtonModule, AvatarUploadDialogComponent],
  templateUrl: './profile-actions.component.html',
  styleUrl: './profile-actions.component.scss',
})
export class ProfileActionsComponent {
  avatarDialog = viewChild<AvatarUploadDialogComponent>('avatarDialog');

  onEditProfile() {
    this.avatarDialog()?.show();
  }
}
