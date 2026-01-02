import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-battle-controls',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './battle-controls.component.html',
  styleUrls: ['./battle-controls.component.scss'],
})
export class BattleControlsComponent {
  @Input() isBattleActive = false;
  @Output() startBattle = new EventEmitter<void>();
  @Output() terminateBattle = new EventEmitter<void>();

  onStartBattle(): void {
    this.startBattle.emit();
  }

  onTerminateBattle(): void {
    this.terminateBattle.emit();
  }
}
