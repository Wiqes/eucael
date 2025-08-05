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
import { PantherIconComponent } from '../icons/panther-icon/panther-icon.component';
import { ANIMALS } from '../../../core/constants/animals';
import { RatIconComponent } from '../icons/rat-icon/rat-icon.component';
import { WolfIconComponent } from '../icons/wolf-icon/wolf-icon.component';

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
      case ANIMALS.FOX:
        return FoxIconComponent;
      case ANIMALS.SNAKE:
        return SnakeIconComponent;
      case ANIMALS.CAT:
        return CatIconComponent;
      case ANIMALS.BAT:
        return BatIconComponent;
      case ANIMALS.EAGLE:
        return EagleIconComponent;
      case ANIMALS.ELK:
        return ElkIconComponent;
      case ANIMALS.GIRAFFE:
        return GiraffeIconComponent;
      case ANIMALS.HORSE:
        return HorseIconComponent;
      case ANIMALS.MOLE:
        return MoleIconComponent;
      case ANIMALS.OWL:
        return OwlIconComponent;
      case ANIMALS.PANTHER:
        return PantherIconComponent;
      case ANIMALS.RAT:
        return RatIconComponent;
      case ANIMALS.WOLF:
        return WolfIconComponent;
      case ANIMALS.BEAR:
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
