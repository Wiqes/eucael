import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-power-surge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './power-surge.component.html',
  styleUrls: ['./power-surge.component.scss'],
})
export class PowerSurgeComponent {
  @Input() animationSpeed: number = 1;

  readonly beams = [
    { position: 1, delay: 0 },
    { position: 2, delay: 0.5 },
  ];
}
