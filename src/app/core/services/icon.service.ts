import { Injectable, Type } from '@angular/core';
import { BearIconComponent } from '../../shared/ui/icons/bear-icon/bear-icon.component';
import { FoxIconComponent } from '../../shared/ui/icons/fox-icon/fox-icon.component';
import { SnakeIconComponent } from '../../shared/ui/icons/snake-icon/snake-icon.component';
import { BatIconComponent } from '../../shared/ui/icons/bat-icon/bat-icon.component';
import { CatIconComponent } from '../../shared/ui/icons/cat-icon/cat-icon.component';
import { EagleIconComponent } from '../../shared/ui/icons/eagle-icon/eagle-icon.component';
import { ElkIconComponent } from '../../shared/ui/icons/elk-icon/elk-icon.component';
import { GiraffeIconComponent } from '../../shared/ui/icons/giraffe-icon/giraffe-icon.component';
import { HorseIconComponent } from '../../shared/ui/icons/horse-icon/horse-icon.component';
import { MoleIconComponent } from '../../shared/ui/icons/mole-icon/mole-icon.component';
import { OwlIconComponent } from '../../shared/ui/icons/owl-icon/owl-icon.component';
import { PantherIconComponent } from '../../shared/ui/icons/panther-icon/panther-icon.component';
import { RatIconComponent } from '../../shared/ui/icons/rat-icon/rat-icon.component';
import { WolfIconComponent } from '../../shared/ui/icons/wolf-icon/wolf-icon.component';
import { ANIMALS } from '../constants/animals';

@Injectable({
  providedIn: 'root',
})
export class IconService {
  /**
   * Returns the appropriate icon component based on the animal name
   * @param iconName - The name of the animal icon
   * @returns The corresponding icon component
   */
  getIconComponent(iconName: string): Type<any> {
    switch (iconName) {
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
  }

  /**
   * Gets all available animal icons
   * @returns Array of all available animal names
   */
  getAvailableIcons(): string[] {
    return Object.values(ANIMALS);
  }

  /**
   * Checks if an icon name is valid
   * @param iconName - The name to validate
   * @returns True if the icon exists, false otherwise
   */
  isValidIcon(iconName: string): boolean {
    return Object.values(ANIMALS).includes(iconName);
  }
}
