import { Component, Type, computed, input } from '@angular/core';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { StepContentComponent } from './step-content.component';
import { StepperButtonsComponent } from './stepper-buttons.component';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [
    CommonModule,
    StepperModule,
    ButtonModule,
    StepperButtonsComponent,
    StepContentComponent,
  ],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
})
export class StepperComponent {
  steps = input<{ label: string; contentComponent: Type<any>; form: FormGroup }[]>([]);
  currentStep = 1;

  trackByIndex(index: number, _item: any) {
    return index;
  }

  onNext(i: number, step: any, activateCallback: Function) {
    activateCallback(i + 2);
    step.form.markAllAsTouched();
  }
}
