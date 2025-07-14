import { Component } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { finalize, switchMap } from 'rxjs';
import { UploadService } from '../../core/services/upload.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-admin',
  imports: [NgIf],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;
  uploadedImageUrl: string | null = null;
  publicUrl: string | null = null;
  error: string | null = null;
  uploadedImageKey: string | null = null;

  constructor(private uploadService: UploadService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.uploadedImageUrl = null;
      this.uploadProgress = 0;
      this.error = null;
    }
  }

  onUpload(): void {
    if (!this.selectedFile) {
      return;
    }

    this.isUploading = true;
    this.error = null;
    const file = this.selectedFile;

    this.uploadService
      .getPresignedUrl(file.name, file.type)
      .pipe(
        switchMap((res) => {
          // Store the key and URL immediately
          this.uploadedImageKey = res.key;
          this.publicUrl = res.publicUrl;
          return this.uploadService.uploadFileToS3(res.uploadUrl, file);
        }),
        finalize(() => (this.isUploading = false)),
      )
      .subscribe((event) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round(100 * (event.loaded / event.total!));
        } else if (event.type === HttpEventType.Response) {
          this.uploadedImageUrl = this.publicUrl;
          console.log('File uploaded successfully', this.publicUrl);
        }
      });
  }

  onDelete(): void {
    if (!this.uploadedImageKey) {
      return;
    }

    // A confirmation dialog is always a good idea
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    this.uploadService.deleteFile(this.uploadedImageKey).subscribe({
      next: () => {
        console.log('File deleted successfully');
        this.uploadedImageUrl = null;
        this.uploadedImageKey = null;
        this.selectedFile = null;
        this.uploadProgress = 0;
      },
      error: (err) => {
        console.error('Error deleting file', err);
        this.error = 'Failed to delete the file.';
      },
    });
  }
}
