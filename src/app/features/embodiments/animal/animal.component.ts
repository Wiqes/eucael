import { Component, computed, input } from '@angular/core';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { IconContainerComponent } from '../../../shared/ui/icon-container/icon-container.component';
import { IAnimal } from '../../../core/models/entities/animal.model';

@Component({
  selector: 'app-animal',
  imports: [CardComponent, IconContainerComponent],
  templateUrl: './animal.component.html',
  styleUrl: './animal.component.scss',
})
export class AnimalComponent {
  isTotemShown = input<boolean>(false);
  animal = input<IAnimal | null>(null);
  animalName = computed(() => this.animal()?.name || '');
  male = computed(() => this.animal()?.male || []);
  female = computed(() => this.animal()?.female || []);
  totem = computed(() => this.animal()?.totem || []);

  getFemaleByColorId(colorId: number) {
    return this.female().find((f) => f.colorId === colorId) || null;
  }

  getMaleByColorId(colorId: number) {
    return this.male().find((m) => m.colorId === colorId) || null;
  }
}
