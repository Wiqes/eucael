import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-constellation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './constellation.component.html',
  styleUrls: ['./constellation.component.scss'],
})
export class ConstellationComponent {
  @Input() intensity: 'low' | 'medium' | 'high' | 'epic' = 'high';

  readonly stars = [
    { symbol: '✯', position: 3, animationDelay: 0.9 },
    { symbol: '✶', position: 4, animationDelay: 1.2 },
    { symbol: '✴', position: 5, animationDelay: 1.5, highIntensityOnly: true },
    { symbol: '✧', position: 7, animationDelay: 2.1, highIntensityOnly: true },
    { symbol: '⭒', position: 8, animationDelay: 2.4, highIntensityOnly: true },
  ];

  get visibleStars() {
    return this.stars.filter(
      (star) => !star.highIntensityOnly || this.intensity === 'epic' || this.intensity === 'high',
    );
  }
}
