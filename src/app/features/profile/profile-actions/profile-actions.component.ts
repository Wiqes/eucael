import { Component, signal, viewChild } from '@angular/core';
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
  selectedFile = signal<File | null>(null);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
  }

  private handleFileSelection(file: File) {
    console.log(file, 'sdf');
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.log('File size must be less than 5MB.');
      return;
    }

    this.selectedFile.set(file);
    this.avatarDialog()?.show();
  }
}
