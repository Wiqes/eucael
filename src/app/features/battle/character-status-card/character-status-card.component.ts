import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattleCharacter } from '../battle.model';
import { HealthBarComponent } from './health-bar/health-bar.component';
import { StatsRowComponent } from './stats-row/stats-row.component';

@Component({
  selector: 'app-character-status-card',
  standalone: true,
  imports: [CommonModule, HealthBarComponent, StatsRowComponent],
  templateUrl: './character-status-card.component.html',
  styleUrls: ['./character-status-card.component.scss'],
})
export class CharacterStatusCardComponent {
  @Input({ required: true }) character!: BattleCharacter;
  @Input() alignment: 'left' | 'right' = 'left';

  get healthBarClass(): string {
    return this.alignment === 'left' ? 'character1' : 'character2';
  }
}
