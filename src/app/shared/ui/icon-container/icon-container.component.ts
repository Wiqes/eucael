import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BearIconComponent } from '../icons/bear-icon/bear-icon.component';
import { FoxIconComponent } from '../icons/fox-icon/fox-icon.component';

@Component({
  selector: 'app-icon-container',
  imports: [CommonModule, BearIconComponent, FoxIconComponent],
  templateUrl: './icon-container.component.html',
  styleUrls: ['./icon-container.component.scss'],
})
export class IconContainerComponent {
  color = input<string>('green');
  iconName = input<string>('bear'); // Default icon
  iconComponent = computed(() => {
    switch (this.iconName()) {
      case 'fox':
        return FoxIconComponent;
      case 'bear':
      default:
        return BearIconComponent;
    }
  });

  containerStyle = computed(() => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '180px',
    width: '180px',
    '--icon-color': this.color(),
  }));
}
