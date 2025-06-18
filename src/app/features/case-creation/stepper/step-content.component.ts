import { Component } from '@angular/core';

@Component({
  selector: 'app-step-content',
  template: `
    <div class="flex flex-col h-48">
      <div
        class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 flex-auto flex justify-center items-center font-medium"
      >
        <div class="stepper-content"><ng-content></ng-content></div>
      </div>
    </div>
  `,
  standalone: true,
  styles: `
    .stepper-content {
        padding-right: 8px;
    }
    `,
})
export class StepContentComponent {}
