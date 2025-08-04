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

  readonly stars = [{ symbol: '✴', position: 5, animationDelay: 1.5, highIntensityOnly: true }];

  get visibleStars() {
    return this.stars.filter(
      (star) => !star.highIntensityOnly || this.intensity === 'epic' || this.intensity === 'medium',
    );
  }
}
