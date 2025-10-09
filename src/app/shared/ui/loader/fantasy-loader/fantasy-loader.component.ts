import { Component, Input, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MysticalOrbComponent,
  RunesContainerComponent,
  ConstellationComponent,
  EnergyWavesComponent,
} from '../effects';
import { CosmicDustComponent } from '../effects/cosmic-dust/cosmic-dust.component';

@Component({
  selector: 'app-fantasy-loader',
  standalone: true,
  imports: [
    CommonModule,
    MysticalOrbComponent,
    RunesContainerComponent,
    ConstellationComponent,
    EnergyWavesComponent,
    CosmicDustComponent,
  ],
  templateUrl: './fantasy-loader.component.html',
  styleUrls: ['./fantasy-loader.component.scss'],
})
export class FantasyLoaderComponent implements OnInit, OnDestroy {
  @Input() text = 'Loading...';
  @Input() showText = true;
  @Input() theme: 'emerald' | 'sapphire' | 'ruby' | 'amethyst' = 'emerald';
  @Input() intensity: 'low' | 'medium' | 'high' | 'epic' = 'high';
  @Input() enableSoundEffects = false;

  // Dynamic state management
  private loadingStage = signal(0);
  private animationSpeed = signal(1);
  private particleCount = signal(6);

  // Computed properties for dynamic behavior
  currentStage = computed(() => this.loadingStage());
  currentSpeed = computed(() => this.animationSpeed());
  totalParticles = computed(() => this.particleCount());

  // Dynamic text animation
  displayedText = signal('');
  private textAnimationInterval?: number;
  private stageInterval?: number;

  // Epic mode features
  readonly epicFeatures = {
    lightningBolts: true,
    portalEffect: true,
    dimensionalRift: true,
    cosmicDust: true,
    powerSurge: true,
  };

  ngOnInit() {
    this.initializeLoader();
    this.startTextAnimation();
    this.startStageProgression();

    if (this.intensity === 'epic') {
      this.enableEpicMode();
    }
  }

  ngOnDestroy() {
    this.clearIntervals();
  }

  private initializeLoader() {
    // Adjust particle count based on intensity
    switch (this.intensity) {
      case 'low':
        this.particleCount.set(4);
        this.animationSpeed.set(0.7);
        break;
      case 'medium':
        this.particleCount.set(2);
        this.animationSpeed.set(1);
        break;
      case 'high':
        this.particleCount.set(8);
        this.animationSpeed.set(1.3);
        break;
      case 'epic':
        this.particleCount.set(4);
        this.animationSpeed.set(1.6);
        break;
    }
  }

  private startTextAnimation() {
    if (!this.showText) return;

    let charIndex = 0;
    this.textAnimationInterval = window.setInterval(() => {
      if (charIndex <= this.text.length) {
        this.displayedText.set(this.text.substring(0, charIndex));
        charIndex++;
      } else {
        // Reset and restart
        charIndex = 0;
        this.displayedText.set('');
      }
    }, 150);
  }

  private startStageProgression() {
    this.stageInterval = window.setInterval(() => {
      this.loadingStage.update((stage) => (stage + 1) % 5);
    }, 2000);
  }

  private enableEpicMode() {
    // Add extra visual effects for epic mode
    document.documentElement.style.setProperty('--epic-mode', '1');
  }

  private clearIntervals() {
    if (this.textAnimationInterval) {
      clearInterval(this.textAnimationInterval);
    }
    if (this.stageInterval) {
      clearInterval(this.stageInterval);
    }
  }

  // Get theme-specific CSS classes
  get themeClass() {
    return `theme-${this.theme}`;
  }

  get intensityClass() {
    return `intensity-${this.intensity}`;
  }
}
