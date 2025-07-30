import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICreature, ITotem } from '../../../core/models/entities/card.model';
import { ImageComponent } from '../image/image.component';

@Component({
  selector: 'app-card',
  imports: [CommonModule, ImageComponent],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  creature = input<ICreature | ITotem | null>(null);
  animalName = input<string>('');
  imageUrl = computed(() => {
    return this.creature()?.imageUrl || '';
  });
  name = computed(() => {
    return (this.creature() as ICreature).name || this.animalName() || 'N/A';
  });
  level = computed(() => {
    return this.creature()?.level || 1;
  });
}
