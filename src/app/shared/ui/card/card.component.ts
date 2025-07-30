import { Component, computed, input, ElementRef, ViewChild } from '@angular/core';
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
  @ViewChild('imageComponent') imageComponent!: ImageComponent;

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

  constructor(private elementRef: ElementRef) {}

  onCardClick() {
    // Add click animation class
    const cardWrapper = this.elementRef.nativeElement.querySelector('.card-wrapper');
    if (cardWrapper) {
      cardWrapper.classList.add('clicking');

      // Remove the class after animation completes
      setTimeout(() => {
        cardWrapper.classList.remove('clicking');
      }, 300);
    }

    // Small delay before showing image preview for visual feedback
    setTimeout(() => {
      this.imageComponent.showImagePreview();
    }, 100);
  }
}
