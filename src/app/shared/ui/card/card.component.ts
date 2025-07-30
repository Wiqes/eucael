import { Component, computed, input } from '@angular/core';
import { ICreature } from '../../../core/models/entities/card.model';
import { ImageComponent } from '../image/image.component';

@Component({
  selector: 'app-card',
  imports: [ImageComponent],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  creature = input<ICreature | null>(null);
  imageUrl = computed(() => {
    return this.creature()?.imageUrl || '';
  });
  name = computed(() => {
    return this.creature()?.name || 'N/A';
  });
}
