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
export class ImageCompareComponent {
  leftUrl = input<string>('');
  rightUrl = input<string>('');
  private readonly elementRef = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);

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
      cursor: grab;
      user-select: none;
      -webkit-user-drag: none;
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

    // Variables for zoom, rotation, and position
    let scale = 1;
    let rotation = 0;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartTranslateX = 0;
    let dragStartTranslateY = 0;

    // Function to update image transform
    const updateTransform = () => {
      img.style.transform = `scale(${scale}) rotate(${rotation}deg) translate(${translateX}px, ${translateY}px)`;
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
        width: 52px;
        height: 52px;
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

    // Add drag functionality to image
    img.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragStartTranslateX = translateX;
      dragStartTranslateY = translateY;
      img.style.cursor = 'grabbing';
    });

    // Add mouse move event for dragging
    overlay.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        translateX = dragStartTranslateX + deltaX;
        translateY = dragStartTranslateY + deltaY;
        updateTransform();
      }
    });

    // Add mouse up event to stop dragging
    overlay.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        img.style.cursor = 'grab';
      }
    });

    // Add mouse leave event to stop dragging when cursor leaves overlay
    overlay.addEventListener('mouseleave', () => {
      if (isDragging) {
        isDragging = false;
        img.style.cursor = 'grab';
      }
    });

    // Add touch support for mobile devices
    img.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
        dragStartTranslateX = translateX;
        dragStartTranslateY = translateY;
      }
    });

    overlay.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length === 1) {
        e.preventDefault();
        const deltaX = e.touches[0].clientX - dragStartX;
        const deltaY = e.touches[0].clientY - dragStartY;
        translateX = dragStartTranslateX + deltaX;
        translateY = dragStartTranslateY + deltaY;
        updateTransform();
      }
    });

    overlay.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Add wheel zoom functionality
    img.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.min(Math.max(scale * zoomFactor, 0.1), 5);

      // Calculate zoom center point relative to image
      const rect = img.getBoundingClientRect();
      const centerX = e.clientX - rect.left - rect.width / 2;
      const centerY = e.clientY - rect.top - rect.height / 2;

      // Adjust translation to zoom towards cursor position
      const scaleRatio = newScale / scale;
      translateX = translateX - centerX * (scaleRatio - 1);
      translateY = translateY - centerY * (scaleRatio - 1);

      scale = newScale;
      updateTransform();
    });

    // Create control buttons
    const zoomInBtn = createButton('🔍+', 'Zoom In', () => {
      scale = Math.min(scale * 1.2, 3);
      updateTransform();
    });

    const zoomOutBtn = createButton('🔍-', 'Zoom Out', () => {
      scale = Math.max(scale / 1.2, 0.5);
      updateTransform();
    });

    const closeBtn = createButton('✕', 'Close', () => {
      document.body.removeChild(overlay);
    });

    // Add buttons to toolbar
    toolbar.appendChild(zoomInBtn);
    toolbar.appendChild(zoomOutBtn);
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
}
