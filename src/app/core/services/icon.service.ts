import { Injectable, Type } from '@angular/core';
import { BearIconComponent } from '../../shared/ui/icons/bear-icon/bear-icon.component';
import { CatIconComponent } from '../../shared/ui/icons/cat-icon/cat-icon.component';
import { GiraffeIconComponent } from '../../shared/ui/icons/giraffe-icon/giraffe-icon.component';
import { HorseIconComponent } from '../../shared/ui/icons/horse-icon/horse-icon.component';
import { RatIconComponent } from '../../shared/ui/icons/rat-icon/rat-icon.component';
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
      case ANIMALS.CAT:
        return CatIconComponent;
      case ANIMALS.GIRAFFE:
        return GiraffeIconComponent;
      case ANIMALS.HORSE:
        return HorseIconComponent;
      case ANIMALS.RAT:
        return RatIconComponent;
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
