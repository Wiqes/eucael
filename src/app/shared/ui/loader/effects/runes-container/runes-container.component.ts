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
  @Input() currentStage: number = 0;

  readonly runes = [
    { symbol: '✦', position: 2 },
    { symbol: '◊', position: 3 },
    { symbol: '◉', position: 4 },
    { symbol: '⟐', position: 5 },
    { symbol: '✧', position: 6 },
    { symbol: '⟢', position: 7, epicOnly: true },
  ];

  get visibleRunes() {
    return this.runes.filter((rune) => !rune.epicOnly || this.intensity === 'epic');
  }
}
