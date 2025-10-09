import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrbParticleComponent } from './orb-particle/orb-particle.component';

@Component({
  selector: 'app-mystical-orb',
  standalone: true,
  imports: [CommonModule, OrbParticleComponent],
  templateUrl: './mystical-orb.component.html',
  styleUrls: ['./mystical-orb.component.scss'],
})
export class MysticalOrbComponent {
  @Input() intensity: 'low' | 'medium' | 'high' | 'epic' = 'high';
  @Input() animationSpeed = 1;
  @Input() particleCount = 8;

  get ringCount() {
    switch (this.intensity) {
      case 'low':
        return 3;
      case 'medium':
        return 3;
      case 'high':
        return 5;
      case 'epic':
        return 5;
      default:
        return 3;
    }
  }

  get rings() {
    return Array.from({ length: this.ringCount }, (_, i) => i + 1);
  }

  get particles() {
    return Array.from({ length: this.particleCount }, (_, i) => i + 1);
  }
}
