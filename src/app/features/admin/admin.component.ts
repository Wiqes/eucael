import { Component, computed, inject } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { finalize, switchMap } from 'rxjs';
import { UploadService } from '../../core/services/data-access/upload.service';
import { NgIf } from '@angular/common';
import { EntityType } from '../../core/constants/entity-type';
import { StateService } from '../../core/services/state.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormControlComponent } from '../../shared/ui/form-control/form-control.component';

@Component({
  selector: 'app-admin',
  imports: [NgIf, ReactiveFormsModule, FormControlComponent],
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
  private readonly stateService = inject(StateService);
  private readonly uploadService = inject(UploadService);
  animals = computed(() => this.stateService.animals());

  adminForm = new FormGroup({
    selectedAnimal: new FormControl<number | null>(null, [Validators.required]),
  });

  get selectedAnimalControl() {
    return this.adminForm.get('selectedAnimal') as FormControl;
  }

  onFileSelected(event: Event): void {
    const selectedAnimalId = this.selectedAnimalControl.value;
    const animal = this.animals().find((a) => a.id === selectedAnimalId);
    console.log('Selected animal:', animal);
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.uploadedImageUrl = null;
      this.uploadProgress = 0;
      this.error = null;
    }
  }

  onUpload(): void {
    if (!this.selectedFile || this.adminForm.invalid) {
      // Mark form as touched to show validation errors
      this.adminForm.markAllAsTouched();
      return;
    }

    const selectedAnimalId = this.selectedAnimalControl.value;
    const animal = this.animals().find((a) => a.id === selectedAnimalId);
    this.isUploading = true;
    this.error = null;
    const file = this.selectedFile;

    this.uploadService
      .getPresignedUrl({
        filename: file.name,
        contentType: file.type,
        entityType: EntityType.TOTEM,
        entityId: selectedAnimalId!, // Use the selected animal ID
      })
      .pipe(
        switchMap((res) => {
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
          console.log('Selected animal ID:', selectedAnimalId);
        }
      });
  }

  onDelete(): void {
    if (!this.publicUrl) {
      return;
    }

    // A confirmation dialog is always a good idea
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    this.uploadService.deleteFile(this.publicUrl).subscribe({
      next: () => {
        console.log('File deleted successfully');
        this.uploadedImageUrl = null;
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
