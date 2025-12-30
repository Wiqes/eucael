import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChipModule } from 'primeng/chip';
import { BattleCharacter } from '../battle.model';

@Component({
  selector: 'app-character-status-card',
  standalone: true,
  imports: [CommonModule, ChipModule],
  templateUrl: './character-status-card.component.html',
  styleUrls: ['./character-status-card.component.scss'],
})
export class CharacterStatusCardComponent {
  @Input({ required: true }) character!: BattleCharacter;
  @Input() alignment: 'left' | 'right' = 'left';

  getHealthPercentage(): number {
    if (!this.character) return 0;
    return (this.character.health / this.character.maxHealth) * 100;
  }

  getHealthBarClass(): string {
    return this.alignment === 'left' ? 'character1' : 'character2';
  }
}
