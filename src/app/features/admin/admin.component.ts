import { Component, computed, inject } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { finalize, switchMap } from 'rxjs';
import { UploadService } from '../../core/services/data-access/upload.service';
import { NgIf } from '@angular/common';
import { EntityType } from '../../core/constants/entity-type';
import { StateService } from '../../core/services/state.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormControlComponent } from '../../shared/ui/form-control/form-control.component';
import { IAnimal } from '../../core/models/entities/animal.model';
import { ICard } from '../../core/models/entities/card.model';

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
    entityType: new FormControl<EntityType | null>(null, [Validators.required]),
  });

  get selectedAnimalControl() {
    return this.adminForm.get('selectedAnimal') as FormControl;
  }

  get entityTypeControl() {
    return this.adminForm.get('entityType') as FormControl;
  }

  // Convert enum to options array for the select
  entityTypeOptions = Object.values(EntityType).map((value) => ({
    name: value.charAt(0).toUpperCase() + value.slice(1), // Capitalize first letter
    value: value,
  }));

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
    if (!this.selectedFile || this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      return;
    }

    const selectedAnimalId = this.selectedAnimalControl.value;
    const selectedEntityType: keyof IAnimal = this.entityTypeControl.value;
    const animal = this.animals().find((a) => a.id === selectedAnimalId);
    const entity: ICard[] = animal ? (animal[selectedEntityType] as ICard[]) : []; // Use the selected entity type
    this.isUploading = true;
    this.error = null;
    const file = this.selectedFile;

    this.uploadService
      .getPresignedUrl({
        filename: file.name,
        contentType: file.type,
        entityType: selectedEntityType as EntityType,
        entityId: entity?.[0]?.id || 0,
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
        }
      });
  }
}
