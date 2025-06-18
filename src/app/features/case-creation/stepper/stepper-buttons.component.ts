import { Component, input, inject, output, signal, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-stepper-buttons',
  template: `
    <div class="flex py-6 gap-2 stepper-buttons" *ngIf="showBack || showNext">
      <p-button
        *ngIf="showBack()"
        [label]="backLabel()"
        variant="outlined"
        (onClick)="back.emit()"
      ></p-button>
      <p-button *ngIf="showNext()" [label]="nextLabel()" (onClick)="next.emit()"></p-button>
    </div>
    <div class="py-6" *ngIf="!showBack() && !showNext()">
      <ng-content></ng-content>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, ButtonModule],
  styles: `
    .stepper-buttons {
      padding: 21px 0;
      display: flex;
      gap: 8px;
    }
  `,
})
export class StepperButtonsComponent {
  private translate = inject(TranslateService);

  showBack = input<boolean>(false);
  showNext = input<boolean>(false);
  backLabel = signal<string>(this.translate.instant('Back'));
  nextLabel = signal<string>(this.translate.instant('Next'));
  back = output<void>();
  next = output<void>();

  constructor() {
    this.translate.onLangChange.subscribe(() => {
      this.backLabel.set(this.translate.instant('Back'));
      this.nextLabel.set(this.translate.instant('Next'));
    });
  }
}
