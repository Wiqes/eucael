import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BearIconComponent } from '../icons/bear-icon/bear-icon.component';
import { FoxIconComponent } from '../icons/fox-icon/fox-icon.component';
import { SnakeIconComponent } from '../icons/snake-icon/snake-icon.component';
import { BatIconComponent } from '../icons/bat-icon/bat-icon.component';
import { CatIconComponent } from '../icons/cat-icon/cat-icon.component';
import { EagleIconComponent } from '../icons/eagle-icon/eagle-icon.component';
import { ElkIconComponent } from '../icons/elk-icon/elk-icon.component';
import { GiraffeIconComponent } from '../icons/giraffe-icon/giraffe-icon.component';
import { HorseIconComponent } from '../icons/horse-icon/horse-icon.component';
import { MoleIconComponent } from '../icons/mole-icon/mole-icon.component';
import { OwlIconComponent } from '../icons/owl-icon/owl-icon.component';

@Component({
  selector: 'app-icon-container',
  imports: [CommonModule],
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
      case 'snake':
        return SnakeIconComponent;
      case 'cat':
        return CatIconComponent;
      case 'bat':
        return BatIconComponent;
      case 'eagle':
        return EagleIconComponent;
      case 'elk':
        return ElkIconComponent;
      case 'giraffe':
        return GiraffeIconComponent;
      case 'horse':
        return HorseIconComponent;
      case 'mole':
        return MoleIconComponent;
      case 'owl':
        return OwlIconComponent;
      case 'bear':
      default:
        return BearIconComponent;
    }
  });

  containerStyle = computed(() => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '240px',
    width: '240px',
    '--icon-color': this.color(),
    position: 'relative',
    cursor: 'pointer',
    overflow: 'hidden',
  }));
}
