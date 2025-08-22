import {
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
  HostListener,
  input,
  effect,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProfileService } from '../../../core/services/profile.service';
import { StateService } from '../../../core/services/state.service';
import { HttpEventType } from '@angular/common/http';
import { MessageService } from '../../../core/services/message.service';
import { MESSAGES } from '../../../core/constants/messages';
import { AvatarService } from '../../../core/services/avatar.service';

@Component({
  selector: 'app-avatar-upload-dialog',
  imports: [CommonModule, TranslateModule, DialogModule, ButtonModule, ProgressBarModule],
  templateUrl: './avatar-upload-dialog.component.html',
  styleUrl: './avatar-upload-dialog.component.scss',
})
export class AvatarUploadDialogComponent {
  private messageService = inject(MessageService);
  private profileService = inject(ProfileService);
  private stateService = inject(StateService);
  private avatarService = inject(AvatarService);
  selectedFile = computed(() => this.avatarService.selectedFile());

  // Dialog state
  visible = signal(false);

  errorMessage = signal<string | null>(null);

  // Upload state
  isUploading = signal(false);
  uploadProgress = signal(0);
  isDragOver = signal(false);

  // Canvas for image cropping
  cropCanvas = viewChild<ElementRef<HTMLCanvasElement>>('cropCanvas');
  cropCanvasSize = 280;

  // Crop state
  private sourceImage: HTMLImageElement | null = null;
  private isDragging = false;
  private isResizing = false;
  private activeHandle: string | null = null;
  private cropArea = { x: 0, y: 0, size: 0 };
  private imageScale = 1;
  private imageOffset = { x: 0, y: 0 };
  private minCropSize = 50;
  zoom = 1; // Make public for template
  private dragStart = { x: 0, y: 0 };
  private cropStart = { x: 0, y: 0, size: 0 };

  // Visual feedback
  currentCursor = signal<string>('default');
  previewImage = signal<string | null>(null);

  constructor() {
    effect(() => {
      const selectedFile = this.selectedFile();
      if (selectedFile) {
        this.loadImageForCropping(selectedFile);
      }
    });
  }

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
    this.avatarService.selectedFile.set(null);
  }

  onCancel() {
    this.hide();
  }

  private resetState() {
    this.errorMessage.set(null);
    this.isUploading.set(false);
    this.uploadProgress.set(0);
    this.isDragOver.set(false);
    this.sourceImage = null;
    this.isDragging = false;
    this.isResizing = false;
    this.activeHandle = null;
    this.zoom = 1;
    this.currentCursor.set('default');
    this.previewImage.set(null);
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
    const scale =
      Math.min(
        this.cropCanvasSize / this.sourceImage.width,
        this.cropCanvasSize / this.sourceImage.height,
      ) * this.zoom;

    this.imageScale = scale;

    // Center the image
    this.imageOffset = {
      x: (this.cropCanvasSize - this.sourceImage.width * scale) / 2,
      y: (this.cropCanvasSize - this.sourceImage.height * scale) / 2,
    };

    // Initialize crop area (square in the center)
    const maxImageDimension = Math.min(
      this.sourceImage.width * scale,
      this.sourceImage.height * scale,
    );
    const cropSize = Math.max(
      this.minCropSize,
      Math.min(maxImageDimension * 0.8, this.cropCanvasSize * 0.6),
    );

    this.cropArea = {
      x: (this.cropCanvasSize - cropSize) / 2,
      y: (this.cropCanvasSize - cropSize) / 2,
      size: cropSize,
    };

    this.drawCanvas();
    this.updatePreview();
  }

  adjustZoom(delta: number) {
    this.zoom = Math.max(0.5, Math.min(3, this.zoom + delta));
    this.setupCropCanvas();
  }

  resetCrop() {
    this.zoom = 1;
    this.setupCropCanvas();
  }

  // Keyboard shortcuts
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.visible()) return;

    switch (event.key) {
      case 'Escape':
        this.hide();
        break;
      case '=':
      case '+':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.adjustZoom(0.2);
        }
        break;
      case '-':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.adjustZoom(-0.2);
        }
        break;
      case '0':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.resetCrop();
        }
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        if (this.selectedFile()) {
          event.preventDefault();
          this.moveCropArea(event.key);
        }
        break;
    }
  }

  private moveCropArea(direction: string) {
    const step = 5;
    let newX = this.cropArea.x;
    let newY = this.cropArea.y;

    switch (direction) {
      case 'ArrowUp':
        newY = Math.max(0, newY - step);
        break;
      case 'ArrowDown':
        newY = Math.min(this.cropCanvasSize - this.cropArea.size, newY + step);
        break;
      case 'ArrowLeft':
        newX = Math.max(0, newX - step);
        break;
      case 'ArrowRight':
        newX = Math.min(this.cropCanvasSize - this.cropArea.size, newX + step);
        break;
    }

    this.cropArea.x = newX;
    this.cropArea.y = newY;
    this.drawCanvas();
    this.updatePreview();
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
    // Draw semi-transparent overlay in four rectangles around the crop area
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';

    // Top rectangle
    ctx.fillRect(0, 0, this.cropCanvasSize, this.cropArea.y);

    // Bottom rectangle
    ctx.fillRect(
      0,
      this.cropArea.y + this.cropArea.size,
      this.cropCanvasSize,
      this.cropCanvasSize - (this.cropArea.y + this.cropArea.size),
    );

    // Left rectangle
    ctx.fillRect(0, this.cropArea.y, this.cropArea.x, this.cropArea.size);

    // Right rectangle
    ctx.fillRect(
      this.cropArea.x + this.cropArea.size,
      this.cropArea.y,
      this.cropCanvasSize - (this.cropArea.x + this.cropArea.size),
      this.cropArea.size,
    );

    ctx.restore();

    // Draw crop area border
    ctx.strokeStyle = '#34f5dd';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.cropArea.x, this.cropArea.y, this.cropArea.size, this.cropArea.size);

    // Draw corner and edge handles
    this.drawResizeHandles(ctx);

    // Draw crop area grid lines
    this.drawGridLines(ctx);
  }

  private drawResizeHandles(ctx: CanvasRenderingContext2D) {
    const handleSize = 12;
    const halfHandle = handleSize / 2;

    ctx.fillStyle = '#34f5dd';
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;

    // Corner handles
    const corners = [
      { x: this.cropArea.x - halfHandle, y: this.cropArea.y - halfHandle, cursor: 'nw-resize' },
      {
        x: this.cropArea.x + this.cropArea.size - halfHandle,
        y: this.cropArea.y - halfHandle,
        cursor: 'ne-resize',
      },
      {
        x: this.cropArea.x - halfHandle,
        y: this.cropArea.y + this.cropArea.size - halfHandle,
        cursor: 'sw-resize',
      },
      {
        x: this.cropArea.x + this.cropArea.size - halfHandle,
        y: this.cropArea.y + this.cropArea.size - halfHandle,
        cursor: 'se-resize',
      },
    ];

    corners.forEach((corner) => {
      ctx.fillRect(corner.x, corner.y, handleSize, handleSize);
      ctx.strokeRect(corner.x, corner.y, handleSize, handleSize);
    });

    // Edge handles (for better UX)
    const edgeHandleSize = 8;
    const halfEdge = edgeHandleSize / 2;

    const edges = [
      {
        x: this.cropArea.x + this.cropArea.size / 2 - halfEdge,
        y: this.cropArea.y - halfEdge,
        cursor: 'n-resize',
      },
      {
        x: this.cropArea.x + this.cropArea.size / 2 - halfEdge,
        y: this.cropArea.y + this.cropArea.size - halfEdge,
        cursor: 's-resize',
      },
      {
        x: this.cropArea.x - halfEdge,
        y: this.cropArea.y + this.cropArea.size / 2 - halfEdge,
        cursor: 'w-resize',
      },
      {
        x: this.cropArea.x + this.cropArea.size - halfEdge,
        y: this.cropArea.y + this.cropArea.size / 2 - halfEdge,
        cursor: 'e-resize',
      },
    ];

    edges.forEach((edge) => {
      ctx.fillRect(edge.x, edge.y, edgeHandleSize, edgeHandleSize);
      ctx.strokeRect(edge.x, edge.y, edgeHandleSize, edgeHandleSize);
    });
  }

  private drawGridLines(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'rgba(52, 245, 221, 0.3)';
    ctx.lineWidth = 1;

    // Draw rule of thirds grid
    const third = this.cropArea.size / 3;

    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(this.cropArea.x + third, this.cropArea.y);
    ctx.lineTo(this.cropArea.x + third, this.cropArea.y + this.cropArea.size);
    ctx.moveTo(this.cropArea.x + third * 2, this.cropArea.y);
    ctx.lineTo(this.cropArea.x + third * 2, this.cropArea.y + this.cropArea.size);

    // Horizontal lines
    ctx.moveTo(this.cropArea.x, this.cropArea.y + third);
    ctx.lineTo(this.cropArea.x + this.cropArea.size, this.cropArea.y + third);
    ctx.moveTo(this.cropArea.x, this.cropArea.y + third * 2);
    ctx.lineTo(this.cropArea.x + this.cropArea.size, this.cropArea.y + third * 2);

    ctx.stroke();
  }

  onMouseMove(event: MouseEvent) {
    if (!this.cropCanvas()) return;

    const canvas = this.cropCanvas()!.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (this.isDragging) {
      this.handleDrag(x, y);
    } else if (this.isResizing) {
      this.handleResize(x, y);
    } else {
      this.updateCursor(x, y);
    }
  }

  onMouseDown(event: MouseEvent) {
    if (!this.cropCanvas()) return;

    const canvas = this.cropCanvas()!.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.dragStart = { x, y };
    this.cropStart = { ...this.cropArea };

    const handle = this.getHandleAtPosition(x, y);
    if (handle) {
      this.isResizing = true;
      this.activeHandle = handle;
      this.currentCursor.set(this.getHandleCursor(handle));
    } else if (this.isInsideCropArea(x, y)) {
      this.isDragging = true;
      this.currentCursor.set('move');
    }

    event.preventDefault();
  }

  onMouseUp() {
    this.isDragging = false;
    this.isResizing = false;
    this.activeHandle = null;
    this.updatePreview();
  }

  onMouseLeave() {
    this.onMouseUp();
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();

    const zoomFactor = 1.1;
    const delta = event.deltaY > 0 ? 1 / zoomFactor : zoomFactor;

    this.zoom = Math.max(0.5, Math.min(3, this.zoom * delta));
    this.setupCropCanvas();
  }

  // Touch events for mobile support
  onTouchStart(event: TouchEvent) {
    event.preventDefault();
    const touch = event.touches[0];
    this.simulateMouseEvent('mousedown', touch);
  }

  onTouchMove(event: TouchEvent) {
    event.preventDefault();
    const touch = event.touches[0];
    this.simulateMouseEvent('mousemove', touch);
  }

  onTouchEnd(event: TouchEvent) {
    event.preventDefault();
    this.onMouseUp();
  }

  private simulateMouseEvent(type: string, touch: Touch) {
    const mouseEvent = new MouseEvent(type, {
      clientX: touch.clientX,
      clientY: touch.clientY,
      bubbles: true,
      cancelable: true,
    });

    if (type === 'mousedown') {
      this.onMouseDown(mouseEvent);
    } else if (type === 'mousemove') {
      this.onMouseMove(mouseEvent);
    }
  }

  private updateCursor(x: number, y: number) {
    const handle = this.getHandleAtPosition(x, y);
    if (handle) {
      this.currentCursor.set(this.getHandleCursor(handle));
    } else if (this.isInsideCropArea(x, y)) {
      this.currentCursor.set('move');
    } else {
      this.currentCursor.set('default');
    }
  }

  private getHandleAtPosition(x: number, y: number): string | null {
    const handleSize = 12;
    const edgeHandleSize = 8;
    const tolerance = 6;

    // Check corner handles
    const corners = [
      { x: this.cropArea.x, y: this.cropArea.y, handle: 'nw' },
      { x: this.cropArea.x + this.cropArea.size, y: this.cropArea.y, handle: 'ne' },
      { x: this.cropArea.x, y: this.cropArea.y + this.cropArea.size, handle: 'sw' },
      {
        x: this.cropArea.x + this.cropArea.size,
        y: this.cropArea.y + this.cropArea.size,
        handle: 'se',
      },
    ];

    for (const corner of corners) {
      if (
        Math.abs(x - corner.x) <= handleSize / 2 + tolerance &&
        Math.abs(y - corner.y) <= handleSize / 2 + tolerance
      ) {
        return corner.handle;
      }
    }

    // Check edge handles
    const edges = [
      { x: this.cropArea.x + this.cropArea.size / 2, y: this.cropArea.y, handle: 'n' },
      {
        x: this.cropArea.x + this.cropArea.size / 2,
        y: this.cropArea.y + this.cropArea.size,
        handle: 's',
      },
      { x: this.cropArea.x, y: this.cropArea.y + this.cropArea.size / 2, handle: 'w' },
      {
        x: this.cropArea.x + this.cropArea.size,
        y: this.cropArea.y + this.cropArea.size / 2,
        handle: 'e',
      },
    ];

    for (const edge of edges) {
      if (
        Math.abs(x - edge.x) <= edgeHandleSize / 2 + tolerance &&
        Math.abs(y - edge.y) <= edgeHandleSize / 2 + tolerance
      ) {
        return edge.handle;
      }
    }

    return null;
  }

  private getHandleCursor(handle: string): string {
    const cursorMap: { [key: string]: string } = {
      nw: 'nw-resize',
      ne: 'ne-resize',
      sw: 'sw-resize',
      se: 'se-resize',
      n: 'n-resize',
      s: 's-resize',
      w: 'w-resize',
      e: 'e-resize',
    };
    return cursorMap[handle] || 'default';
  }

  private isInsideCropArea(x: number, y: number): boolean {
    return (
      x >= this.cropArea.x &&
      x <= this.cropArea.x + this.cropArea.size &&
      y >= this.cropArea.y &&
      y <= this.cropArea.y + this.cropArea.size
    );
  }

  private handleDrag(x: number, y: number) {
    const deltaX = x - this.dragStart.x;
    const deltaY = y - this.dragStart.y;

    const newX = this.cropStart.x + deltaX;
    const newY = this.cropStart.y + deltaY;

    // Keep crop area within canvas bounds
    this.cropArea.x = Math.max(0, Math.min(this.cropCanvasSize - this.cropArea.size, newX));
    this.cropArea.y = Math.max(0, Math.min(this.cropCanvasSize - this.cropArea.size, newY));

    this.drawCanvas();
  }

  private handleResize(x: number, y: number) {
    if (!this.activeHandle) return;

    const deltaX = x - this.dragStart.x;
    const deltaY = y - this.dragStart.y;

    let newX = this.cropStart.x;
    let newY = this.cropStart.y;
    let newSize = this.cropStart.size;

    // Handle different resize directions
    switch (this.activeHandle) {
      case 'nw':
        newX = this.cropStart.x + deltaX;
        newY = this.cropStart.y + deltaY;
        newSize = this.cropStart.size - Math.max(deltaX, deltaY);
        break;
      case 'ne':
        newY = this.cropStart.y + deltaY;
        newSize = this.cropStart.size + Math.max(-deltaX, deltaY);
        break;
      case 'sw':
        newX = this.cropStart.x + deltaX;
        newSize = this.cropStart.size + Math.max(-deltaX, deltaY);
        break;
      case 'se':
        newSize = this.cropStart.size + Math.max(deltaX, deltaY);
        break;
      case 'n':
        newY = this.cropStart.y + deltaY;
        newSize = this.cropStart.size - deltaY;
        break;
      case 's':
        newSize = this.cropStart.size + deltaY;
        break;
      case 'w':
        newX = this.cropStart.x + deltaX;
        newSize = this.cropStart.size - deltaX;
        break;
      case 'e':
        newSize = this.cropStart.size + deltaX;
        break;
    }

    // Apply constraints
    newSize = Math.max(this.minCropSize, newSize);
    newSize = Math.min(newSize, Math.min(this.cropCanvasSize - newX, this.cropCanvasSize - newY));

    // Adjust position if size was constrained
    if (newX < 0) {
      newX = 0;
    }
    if (newY < 0) {
      newY = 0;
    }
    if (newX + newSize > this.cropCanvasSize) {
      newX = this.cropCanvasSize - newSize;
    }
    if (newY + newSize > this.cropCanvasSize) {
      newY = this.cropCanvasSize - newSize;
    }

    this.cropArea = { x: newX, y: newY, size: newSize };
    this.drawCanvas();
  }

  private updatePreview() {
    if (!this.sourceImage || !this.selectedFile()) return;

    // Create a small preview of the cropped area
    const previewSize = 100;
    const canvas = document.createElement('canvas');
    canvas.width = previewSize;
    canvas.height = previewSize;
    const ctx = canvas.getContext('2d')!;

    // Calculate crop coordinates in original image space
    const scaleBack = 1 / this.imageScale;
    const cropX = (this.cropArea.x - this.imageOffset.x) * scaleBack;
    const cropY = (this.cropArea.y - this.imageOffset.y) * scaleBack;
    const cropSize = this.cropArea.size * scaleBack;

    ctx.drawImage(
      this.sourceImage,
      Math.max(0, cropX),
      Math.max(0, cropY),
      Math.min(cropSize, this.sourceImage.width - Math.max(0, cropX)),
      Math.min(cropSize, this.sourceImage.height - Math.max(0, cropY)),
      0,
      0,
      previewSize,
      previewSize,
    );

    this.previewImage.set(canvas.toDataURL());
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

            this.messageService.sendMessage(MESSAGES.AVATAR_UPLOAD_SUCCESS);
            this.hide();
          }
        },
        error: (error) => {
          console.error('Upload error:', error);
          const errorMsg = error.error?.message || 'Failed to upload avatar. Please try again.';
          this.errorMessage.set(errorMsg);
          this.messageService.sendMessage(MESSAGES.AVATAR_UPLOAD_FAILED);
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
