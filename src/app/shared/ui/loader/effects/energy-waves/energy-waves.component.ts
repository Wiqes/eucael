import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-energy-waves',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './energy-waves.component.html',
  styleUrls: ['./energy-waves.component.scss'],
})
export class EnergyWavesComponent {
  @Input() intensity: 'low' | 'medium' | 'high' | 'epic' = 'high';
  @Input() animationSpeed = 1;

  readonly waves = [
    { position: 1, delay: 0 },
    { position: 2, delay: 0.7 },
    { position: 3, delay: 1.4 },
    { position: 4, delay: 0.35, highIntensityOnly: true },
    { position: 5, delay: 1.05, highIntensityOnly: true },
  ];

  readonly shockwaves = [
    { position: 1, delay: 0 },
    { position: 2, delay: 1.5 },
  ];

  get visibleWaves() {
    return this.waves.filter(
      (wave) => !wave.highIntensityOnly || this.intensity === 'epic' || this.intensity === 'high',
    );
  }

  get showShockwaves() {
    return this.intensity === 'epic' || this.intensity === 'high';
  }
}
