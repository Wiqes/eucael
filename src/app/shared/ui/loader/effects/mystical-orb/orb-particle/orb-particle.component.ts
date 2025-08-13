import { Component, input } from '@angular/core';

@Component({
  selector: 'app-orb-particle',
  imports: [],
  templateUrl: './orb-particle.component.html',
  styleUrl: './orb-particle.component.scss',
})
export class OrbParticleComponent {
  particle = input<any>(null);
}
