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
    alert('Button clicked! This should work.');

    // For now, let's just show the custom modal directly
    this.showImagePreview();
  }

  private showImagePreview() {
    console.log('Showing dynamic image preview');

    // Create a simple modal-like overlay to show the full image
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      cursor: pointer;
    `;

    const img = document.createElement('img');
    img.src = this.rightUrl();
    img.alt = 'Full Size Image';
    img.style.cssText = `
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    // Close overlay when clicked
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

    overlay.appendChild(img);
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
