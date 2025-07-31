import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-portal-effect',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portal-effect.component.html',
  styleUrls: ['./portal-effect.component.scss'],
})
export class PortalEffectComponent {
  @Input() intensity: 'low' | 'medium' | 'high' | 'epic' = 'high';
  @Input() animationSpeed: number = 1;

  get ringCount() {
    switch (this.intensity) {
      case 'low':
        return 2;
      case 'medium':
        return 3;
      case 'high':
        return 4;
      case 'epic':
        return 4;
      default:
        return 4;
    }
  }

  get rings() {
    return Array.from({ length: this.ringCount }, (_, i) => i + 1);
  }
}
