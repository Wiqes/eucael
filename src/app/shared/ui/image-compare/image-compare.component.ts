import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { ImageCompareModule } from 'primeng/imagecompare';
import { ImageModule } from 'primeng/image';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-image-compare',
  imports: [ImageCompareModule, ImageModule, ButtonModule, TooltipModule],
  templateUrl: './image-compare.component.html',
  styleUrl: './image-compare.component.scss',
})
export class ImageCompareComponent implements AfterViewInit {
  leftUrl = input<string>('');
  rightUrl = input<string>('');
  private readonly elementRef = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);

  ngAfterViewInit() {
    this.setRangeValues();
  }

  onViewFullImage() {
    console.log('🔍 View button clicked!');
    console.log('Right URL:', this.rightUrl());

    // Check if we have a valid image URL
    if (!this.rightUrl()) {
      console.error('No image URL provided');
      return;
    }

    // Always use our custom modal for now to ensure it works
    this.showImagePreview();
  }
  private showImagePreview() {
    console.log('Showing dynamic image preview');

    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      cursor: pointer;
    `;

    // Create image container
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
      position: relative;
      max-width: 90%;
      max-height: 90%;
      display: flex;
      justify-content: center;
      align-items: center;
    `;

    // Create image
    const img = document.createElement('img');
    img.src = this.rightUrl();
    img.alt = 'Full Size Image';
    img.style.cssText = `
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      transition: transform 0.3s ease;
      cursor: grab;
    `;

    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 8px;
      padding: 0.5rem;
      display: flex;
      gap: 0.5rem;
    `;

    // Variables for zoom and rotation
    let scale = 1;
    let rotation = 0;

    // Function to update image transform
    const updateTransform = () => {
      img.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
    };

    // Create buttons
    const createButton = (icon: string, title: string, onClick: () => void) => {
      const button = document.createElement('button');
      button.innerHTML = icon;
      button.title = title;
      button.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        color: white;
        cursor: pointer;
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 50px;
      `;

      button.addEventListener('mouseenter', () => {
        button.style.background = 'rgba(255, 255, 255, 0.2)';
      });

      button.addEventListener('mouseleave', () => {
        button.style.background = 'rgba(255, 255, 255, 0.1)';
      });

      button.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick();
      });

      return button;
    };

    // Create control buttons
    const zoomInBtn = createButton('🔍+', 'Zoom In', () => {
      scale = Math.min(scale * 1.2, 3);
      updateTransform();
    });

    const zoomOutBtn = createButton('🔍-', 'Zoom Out', () => {
      scale = Math.max(scale / 1.2, 0.5);
      updateTransform();
    });

    const rotateBtn = createButton('🔄', 'Rotate', () => {
      rotation = (rotation + 90) % 360;
      updateTransform();
    });

    const closeBtn = createButton('✕', 'Close', () => {
      document.body.removeChild(overlay);
    });

    // Add buttons to toolbar
    toolbar.appendChild(zoomInBtn);
    toolbar.appendChild(zoomOutBtn);
    toolbar.appendChild(rotateBtn);
    toolbar.appendChild(closeBtn);

    // Prevent image container clicks from closing the modal
    imageContainer.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Close overlay when background is clicked
    overlay.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    // Close on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.body.removeChild(overlay);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Assemble the modal
    imageContainer.appendChild(img);
    imageContainer.appendChild(toolbar);
    overlay.appendChild(imageContainer);
    document.body.appendChild(overlay);
  }

  private setRangeValues(attempt: number = 1): void {
    const delay = attempt * 200;

    setTimeout(() => {
      const rangeInputs = this.elementRef.nativeElement.querySelectorAll(
        'input[type="range"], p-imagecompare input[type="range"]',
      );

      if (rangeInputs.length > 0) {
        rangeInputs.forEach((input: HTMLInputElement, index: number) => {
          input.value = '100';

          // Trigger multiple events to ensure the change is detected
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });

        // Force change detection
        this.cdr.detectChanges();
      } else if (attempt < 5) {
        // Retry up to 5 times if no inputs found
        console.log(`No range inputs found, retrying in ${delay * 2}ms`);
        this.setRangeValues(attempt + 1);
      } else {
        console.warn('Could not find any range inputs after 5 attempts');
      }
    }, delay);
  }
}
