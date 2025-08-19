import {
  Component,
  computed,
  ElementRef,
  inject,
  output,
  signal,
  viewChild,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';
import { ProfileService } from '../../../core/services/profile.service';
import { StateService } from '../../../core/services/state.service';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-avatar-upload-dialog',
  imports: [CommonModule, TranslateModule, DialogModule, ButtonModule, ProgressBarModule],
  templateUrl: './avatar-upload-dialog.component.html',
  styleUrl: './avatar-upload-dialog.component.scss',
})
export class AvatarUploadDialogComponent {
  private profileService = inject(ProfileService);
  private messageService = inject(MessageService);
  private stateService = inject(StateService);

  // Dialog state
  visible = signal(false);

  // File handling
  selectedFile = signal<File | null>(null);
  errorMessage = signal<string | null>(null);

  // Upload state
  isUploading = signal(false);
  uploadProgress = signal(0);
  isDragOver = signal(false);

  // Canvas for image cropping
  cropCanvas = viewChild<ElementRef<HTMLCanvasElement>>('cropCanvas');
  cropCanvasSize = 300;

  // Crop state
  private sourceImage: HTMLImageElement | null = null;
  private isDragging = false;
  private cropArea = { x: 0, y: 0, size: 0 };
  private imageScale = 1;
  private imageOffset = { x: 0, y: 0 };

  // Output events
  onUploadSuccess = output<string>();
  onUploadError = output<string>();

  show() {
    this.visible.set(true);
    this.resetState();
  }

  hide() {
    this.visible.set(false);
    this.resetState();
  }

  onDialogClose() {
    this.hide();
  }

  onCancel() {
    this.hide();
  }

  private resetState() {
    this.selectedFile.set(null);
    this.errorMessage.set(null);
    this.isUploading.set(false);
    this.uploadProgress.set(0);
    this.isDragOver.set(false);
    this.sourceImage = null;
    this.isDragging = false;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
  }

  private handleFileSelection(file: File) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Please select a valid image file.');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set('File size must be less than 5MB.');
      return;
    }

    this.selectedFile.set(file);
    this.errorMessage.set(null);

    // Load image for preview and cropping
    this.loadImageForCropping(file);
  }

  private loadImageForCropping(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.sourceImage = img;
        this.setupCropCanvas();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  private setupCropCanvas() {
    if (!this.sourceImage || !this.cropCanvas()) return;

    const canvas = this.cropCanvas()!.nativeElement;
    const ctx = canvas.getContext('2d')!;

    // Calculate scaling to fit image in canvas
    const scale = Math.min(
      this.cropCanvasSize / this.sourceImage.width,
      this.cropCanvasSize / this.sourceImage.height,
    );

    this.imageScale = scale;

    // Center the image
    this.imageOffset = {
      x: (this.cropCanvasSize - this.sourceImage.width * scale) / 2,
      y: (this.cropCanvasSize - this.sourceImage.height * scale) / 2,
    };

    // Initialize crop area (square in the center)
    const cropSize = Math.min(this.sourceImage.width, this.sourceImage.height) * scale * 0.8;
    this.cropArea = {
      x: (this.cropCanvasSize - cropSize) / 2,
      y: (this.cropCanvasSize - cropSize) / 2,
      size: cropSize,
    };

    this.drawCanvas();
  }

  private drawCanvas() {
    if (!this.sourceImage || !this.cropCanvas()) return;

    const canvas = this.cropCanvas()!.nativeElement;
    const ctx = canvas.getContext('2d')!;

    // Clear canvas
    ctx.clearRect(0, 0, this.cropCanvasSize, this.cropCanvasSize);

    // Draw the image
    ctx.drawImage(
      this.sourceImage,
      this.imageOffset.x,
      this.imageOffset.y,
      this.sourceImage.width * this.imageScale,
      this.sourceImage.height * this.imageScale,
    );

    // Draw crop overlay
    this.drawCropOverlay(ctx);
  }

  private drawCropOverlay(ctx: CanvasRenderingContext2D) {
    // Draw semi-transparent overlay
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.cropCanvasSize, this.cropCanvasSize);

    // Cut out the crop area
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(this.cropArea.x, this.cropArea.y, this.cropArea.size, this.cropArea.size);

    ctx.restore();

    // Draw crop area border
    ctx.strokeStyle = '#34f5dd';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.cropArea.x, this.cropArea.y, this.cropArea.size, this.cropArea.size);

    // Draw corner handles
    const handleSize = 8;
    ctx.fillStyle = '#34f5dd';

    // Top-left corner
    ctx.fillRect(
      this.cropArea.x - handleSize / 2,
      this.cropArea.y - handleSize / 2,
      handleSize,
      handleSize,
    );

    // Top-right corner
    ctx.fillRect(
      this.cropArea.x + this.cropArea.size - handleSize / 2,
      this.cropArea.y - handleSize / 2,
      handleSize,
      handleSize,
    );

    // Bottom-left corner
    ctx.fillRect(
      this.cropArea.x - handleSize / 2,
      this.cropArea.y + this.cropArea.size - handleSize / 2,
      handleSize,
      handleSize,
    );

    // Bottom-right corner
    ctx.fillRect(
      this.cropArea.x + this.cropArea.size - handleSize / 2,
      this.cropArea.y + this.cropArea.size - handleSize / 2,
      handleSize,
      handleSize,
    );
  }

  startCrop(event: MouseEvent) {
    this.isDragging = true;
    this.updateCrop(event);
  }

  updateCrop(event: MouseEvent) {
    if (!this.isDragging || !this.cropCanvas()) return;

    const canvas = this.cropCanvas()!.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Update crop area position (keep it within bounds)
    const maxX = this.cropCanvasSize - this.cropArea.size;
    const maxY = this.cropCanvasSize - this.cropArea.size;

    this.cropArea.x = Math.max(0, Math.min(maxX, x - this.cropArea.size / 2));
    this.cropArea.y = Math.max(0, Math.min(maxY, y - this.cropArea.size / 2));

    this.drawCanvas();
  }

  endCrop() {
    this.isDragging = false;
  }

  private cropImageToSquare(): Promise<File> {
    return new Promise((resolve, reject) => {
      if (!this.sourceImage || !this.selectedFile()) {
        reject(new Error('No image selected'));
        return;
      }

      // Create a temporary canvas for cropping
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;

      // Set canvas size to desired output size (e.g., 400x400)
      const outputSize = 400;
      tempCanvas.width = outputSize;
      tempCanvas.height = outputSize;

      // Calculate crop coordinates in original image space
      const scaleBack = 1 / this.imageScale;
      const cropX = (this.cropArea.x - this.imageOffset.x) * scaleBack;
      const cropY = (this.cropArea.y - this.imageOffset.y) * scaleBack;
      const cropSize = this.cropArea.size * scaleBack;

      // Draw the cropped and scaled image
      tempCtx.drawImage(
        this.sourceImage,
        Math.max(0, cropX),
        Math.max(0, cropY),
        Math.min(cropSize, this.sourceImage.width - Math.max(0, cropX)),
        Math.min(cropSize, this.sourceImage.height - Math.max(0, cropY)),
        0,
        0,
        outputSize,
        outputSize,
      );

      // Convert canvas to blob
      tempCanvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new file with original name
            const croppedFile = new File([blob], this.selectedFile()!.name, {
              type: this.selectedFile()!.type,
              lastModified: Date.now(),
            });
            resolve(croppedFile);
          } else {
            reject(new Error('Failed to crop image'));
          }
        },
        this.selectedFile()!.type,
        0.9,
      );
    });
  }

  async onUpload() {
    if (!this.selectedFile()) return;

    try {
      this.isUploading.set(true);
      this.errorMessage.set(null);

      // Crop the image to square
      const croppedFile = await this.cropImageToSquare();

      // Upload using ProfileService
      this.profileService.uploadAvatar(croppedFile).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const progress = Math.round(100 * (event.loaded / event.total));
            this.uploadProgress.set(progress);
          } else if (event.type === HttpEventType.Response) {
            // Upload completed successfully
            // Update the user's avatar URL in the state
            if (event.publicUrl) {
              this.stateService.updateUserProfile({ avatarUrl: event.publicUrl });
            }

            this.onUploadSuccess.emit('Avatar uploaded successfully');
            this.hide();
          }
        },
        error: (error) => {
          console.error('Upload error:', error);
          const errorMsg = error.error?.message || 'Failed to upload avatar. Please try again.';
          this.errorMessage.set(errorMsg);
          this.onUploadError.emit(errorMsg);
        },
        complete: () => {
          this.isUploading.set(false);
        },
      });
    } catch (error) {
      console.error('Crop error:', error);
      this.errorMessage.set('Failed to process image. Please try again.');
      this.isUploading.set(false);
    }
  }
}
