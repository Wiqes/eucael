import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { BattleActionType } from '../battle.model';

@Component({
  selector: 'app-battle-controls',
  standalone: true,
  imports: [CommonModule, ButtonModule, TranslateModule],
  templateUrl: './battle-controls.component.html',
  styleUrls: ['./battle-controls.component.scss'],
})
export class BattleControlsComponent {
  @Input() isBattleActive = false;
  @Input() isAwaitingPlayerAction = false;
  @Output() readonly startBattle = new EventEmitter<void>();
  @Output() readonly playerAction = new EventEmitter<BattleActionType>();

  onStartBattle(): void {
    this.startBattle.emit();
  }

  onPlayerAction(actionType: BattleActionType): void {
    this.playerAction.emit(actionType);
  }
}
