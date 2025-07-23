import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { ImageCompareModule } from 'primeng/imagecompare';

@Component({
  selector: 'app-image-compare',
  imports: [ImageCompareModule],
  templateUrl: './image-compare.component.html',
  styleUrl: './image-compare.component.scss',
})
export class ImageCompareComponent implements AfterViewInit {
  leftUrl = input<string>('');
  rightUrl = input<string>('');
  private readonly elementRef = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);

  ngAfterViewInit() {
    // Set default value of all range input fields to 90
    // Use multiple attempts with increasing delays to ensure components are ready
    this.setRangeValues();
  }

  private setRangeValues(attempt: number = 1): void {
    const delay = attempt * 200; // Increase delay with each attempt

    setTimeout(() => {
      console.log(`Attempt ${attempt} to set range values`);

      // Try multiple selectors to find the range inputs
      const rangeInputs = this.elementRef.nativeElement.querySelectorAll(
        'input[type="range"], p-imagecompare input[type="range"]',
      );

      console.log(`Found ${rangeInputs.length} range inputs`);

      if (rangeInputs.length > 0) {
        rangeInputs.forEach((input: HTMLInputElement, index: number) => {
          console.log(`Setting range input ${index} to value 100`);
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
