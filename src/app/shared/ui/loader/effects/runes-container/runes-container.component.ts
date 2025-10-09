import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-runes-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './runes-container.component.html',
  styleUrls: ['./runes-container.component.scss'],
})
export class RunesContainerComponent {
  @Input() intensity: 'low' | 'medium' | 'high' | 'epic' = 'high';
  @Input() currentStage = 0;

  readonly runes = [{ symbol: '✦', position: 2 }];

  get visibleRunes() {
    return this.runes;
  }
}
