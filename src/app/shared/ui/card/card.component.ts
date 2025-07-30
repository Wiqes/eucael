import { Component, computed, input } from '@angular/core';
import { ICreature } from '../../../core/models/entities/card.model';
import { ImageCompareComponent } from '../image-compare/image-compare.component';

@Component({
  selector: 'app-card',
  imports: [ImageCompareComponent],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  creature = input<ICreature | null>(null);
  imageUrl = computed(() => {
    return this.creature()?.imageUrl || '';
  });
}
