import { Component } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { finalize } from 'rxjs';
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
  error: string | null = null;

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

    // Step 1: Get Pre-signed URL
    this.uploadService.getPresignedUrl(file.name, file.type).subscribe({
      next: (res) => {
        // Step 2: Upload file to S3
        this.uploadService
          .uploadFileToS3(res.uploadUrl, file)
          .pipe(finalize(() => (this.isUploading = false)))
          .subscribe((event) => {
            if (event.type === HttpEventType.UploadProgress) {
              this.uploadProgress = Math.round(100 * (event.loaded / event.total!));
            } else if (event.type === HttpEventType.Response) {
              console.log('Upload successful!');
              this.uploadedImageUrl = res.publicUrl;
            }
          });
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to get pre-signed URL.';
        this.isUploading = false;
      },
    });
  }
}
