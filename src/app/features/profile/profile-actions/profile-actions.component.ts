import { Component, inject, viewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { AvatarUploadDialogComponent } from '../../../shared/ui/avatar-upload-dialog/avatar-upload-dialog.component';
import { AvatarService } from '../../../core/services/avatar.service';
import { MESSAGES } from '../../../core/constants/messages';
import { MessageService } from '../../../core/services/message.service';

@Component({
  selector: 'app-profile-actions',
  imports: [TranslateModule, ButtonModule, AvatarUploadDialogComponent],
  templateUrl: './profile-actions.component.html',
  styleUrl: './profile-actions.component.scss',
})
export class ProfileActionsComponent {
  avatarDialog = viewChild<AvatarUploadDialogComponent>('avatarDialog');
  private readonly avatarService = inject(AvatarService);
  private readonly messageService = inject(MessageService);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
    // Reset the input value to allow selecting the same file again
    input.value = '';
  }

  private handleFileSelection(file: File) {
    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      this.messageService.sendMessage(MESSAGES.FILE_SIZE_ERROR);
      return;
    }

    this.avatarService.selectedFile.set(file);
    this.avatarDialog()?.show();
  }
}
