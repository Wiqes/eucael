import { Component, computed, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconService } from '../../../core/services/icon.service';
import { IconParticlesComponent } from './icon-particles/icon-particles.component';

@Component({
  selector: 'app-icon-container',
  imports: [CommonModule, IconParticlesComponent],
  templateUrl: './icon-container.component.html',
  styleUrls: ['./icon-container.component.scss'],
})
export class IconContainerComponent {
  private iconService = inject(IconService);

  color = input<string>('green');
  iconName = input<string>('bear'); // Default icon

  iconComponent = computed(() => {
    return this.iconService.getIconComponent(this.iconName());
  });

  containerStyle = computed(() => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '342px',
    width: '240px',
    '--icon-color': this.color(),
    position: 'relative',
    cursor: 'pointer',
    overflow: 'hidden',
  }));
}
