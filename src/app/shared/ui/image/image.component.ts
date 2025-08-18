import { Component, input } from '@angular/core';
import { ImageCompareModule } from 'primeng/imagecompare';
import { ImageModule } from 'primeng/image';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-image',
  imports: [ImageCompareModule, ImageModule, ButtonModule, TooltipModule],
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss',
})
export class ImageComponent {
  leftUrl = input<string>('');
  imageUrl = input<string>('');

  public showImagePreview() {
    // Check if we have a valid image URL before showing preview
    if (!this.imageUrl()) {
      console.error('Cannot show image preview: No image URL provided');
      return;
    }

    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      cursor: pointer;
      transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
      transform: scale(0.8) translateY(20px);
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    // Create image
    const img = document.createElement('img');
    img.src = this.imageUrl();
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

    // Add image load animation with initial scale
    img.style.transform = 'scale(0.95)';
    img.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

    img.onload = () => {
      img.style.transform = 'scale(1)';
      // Remove transition after load animation to not interfere with dragging
      setTimeout(() => {
        img.style.transition = 'none';
      }, 300);
    };

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
      transform: translateY(-10px);
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;
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
        color: #34f5dd;
        cursor: pointer;
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 52px;
        height: 52px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        transform: scale(1);
      `;

      // Style PrimeNG icons specifically
      const iconElement = button.querySelector('.pi');
      if (iconElement) {
        (iconElement as HTMLElement).style.fontSize = '22px';
      }

      button.addEventListener('mouseenter', () => {
        button.style.background = 'rgba(255, 255, 255, 0.2)';
        button.style.transform = 'scale(1.05)';
      });

      button.addEventListener('mouseleave', () => {
        button.style.background = 'rgba(255, 255, 255, 0.1)';
        button.style.transform = 'scale(1)';
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
      // Ensure no transitions interfere with dragging
      img.style.transition = 'none';
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
        // Ensure no transitions interfere with touch dragging
        img.style.transition = 'none';
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
    const zoomInBtn = createButton('<i class="pi pi-search-plus"></i>', 'Zoom In', () => {
      scale = Math.min(scale * 1.2, 3);
      updateTransform();
    });

    const zoomOutBtn = createButton('<i class="pi pi-search-minus"></i>', 'Zoom Out', () => {
      scale = Math.max(scale / 1.2, 0.5);
      updateTransform();
    });

    const closeBtn = createButton('✕', 'Close', () => {
      this.closeImagePreview(overlay);
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
      this.closeImagePreview(overlay);
    });

    // Close on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.closeImagePreview(overlay);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Assemble the modal
    imageContainer.appendChild(img);
    imageContainer.appendChild(toolbar);
    overlay.appendChild(imageContainer);
    document.body.appendChild(overlay);

    // Trigger animations after adding to DOM
    requestAnimationFrame(() => {
      overlay.style.background = 'rgba(0, 0, 0, 0.9)';
      imageContainer.style.transform = 'scale(1) translateY(0)';
      imageContainer.style.opacity = '1';
      toolbar.style.transform = 'translateY(0)';
      toolbar.style.opacity = '1';
    });
  }

  private closeImagePreview(overlay: HTMLElement) {
    const imageContainer = overlay.querySelector('div') as HTMLElement;
    const toolbar = overlay.querySelector('div > div:last-child') as HTMLElement;

    // Animate out
    overlay.style.background = 'rgba(0, 0, 0, 0)';
    if (imageContainer) {
      imageContainer.style.transform = 'scale(0.8) translateY(20px)';
      imageContainer.style.opacity = '0';
    }
    if (toolbar) {
      toolbar.style.transform = 'translateY(-10px)';
      toolbar.style.opacity = '0';
    }

    // Remove after animation completes
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }, 400);
  }
}
