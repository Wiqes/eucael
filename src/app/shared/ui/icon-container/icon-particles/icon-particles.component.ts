import { NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-icon-particles',
  imports: [NgFor],
  templateUrl: './icon-particles.component.html',
  styleUrl: './icon-particles.component.scss',
})
export class IconParticlesComponent implements OnInit {
  particles: number[] = [];

  ngOnInit() {
    // Generate 25 particles for even more dynamic animation
    this.particles = Array.from({ length: 25 }, (_, i) => i + 1);
  }

  trackByParticle(index: number, particle: number): number {
    return particle;
  }
}
