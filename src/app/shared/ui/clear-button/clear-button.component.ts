import { Component, output } from '@angular/core';

@Component({
  selector: 'app-clear-button',
  imports: [],
  templateUrl: './clear-button.component.html',
  styleUrl: './clear-button.component.scss',
})
export class ClearButtonComponent {
  cleared = output<void>();

  onClear(): void {
    this.cleared.emit();
  }
}
