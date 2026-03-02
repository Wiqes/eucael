import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-health-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './health-bar.component.html',
  styleUrls: ['./health-bar.component.scss'],
})
export class HealthBarComponent {
  @Input({ required: true }) health!: number;
  @Input({ required: true }) maxHealth!: number;
  @Input({ required: true }) healthBarClass!: string;
  @Input() alignment: 'left' | 'right' = 'left';

  get healthPercentage(): number {
    if (!this.maxHealth) return 0;
    return (this.health / this.maxHealth) * 100;
  }
}
