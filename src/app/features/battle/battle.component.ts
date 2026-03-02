import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattleService } from './battle.service';
import { BattleActionType, BattleCharacter, BattleState } from './battle.model';
import { Subject, map, takeUntil } from 'rxjs';
import { CharacterStatusCardComponent } from './character-status-card/character-status-card.component';
import { VictoryBannerComponent } from './victory-banner/victory-banner.component';
import { BattleControlsComponent } from './battle-controls/battle-controls.component';
import { BattleCanvasComponent } from './battle-canvas/battle-canvas.component';
import { Router } from '@angular/router';
import { BATTLE_CHARACTERS } from '../../core/constants/battle-character';

@Component({
  selector: 'app-battle',
  standalone: true,
  imports: [
    CommonModule,
    CharacterStatusCardComponent,
    VictoryBannerComponent,
    BattleControlsComponent,
    BattleCanvasComponent,
  ],
  templateUrl: './battle.component.html',
  styleUrls: ['./battle.component.scss'],
})
export class BattleComponent implements OnInit, OnDestroy {
  @ViewChild(BattleCanvasComponent) battleCanvas!: BattleCanvasComponent;

  private readonly destroy$ = new Subject<void>();
  private readonly battleService = inject(BattleService);
  private readonly router = inject(Router);

  readonly battleState$ = this.battleService.battleState$;
  readonly isBattleActive$ = this.battleState$.pipe(map((state) => state !== null));
  readonly awaitingPlayerAction$ = this.battleService.awaitingPlayerAction$;
  character1: BattleCharacter | null = null;
  character2: BattleCharacter | null = null;

  ngOnInit(): void {
    this.battleService.battleState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => this.updateActiveCharacters(state));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.battleService.resetBattle();
  }

  startBattle(): void {
    this.battleService.startBattle([BATTLE_CHARACTERS['HORSE']], [BATTLE_CHARACTERS['GIRAFFE']]);
  }

  resetAndTerminateBattle(): void {
    if (this.battleCanvas) {
      this.battleCanvas.clearCharacters();
    }
    this.battleService.resetBattle();
    this.character1 = null;
    this.character2 = null;
    this.router.navigate(['/']);
  }

  onPlayerAction(actionType: BattleActionType): void {
    this.battleService.performPlayerAction(actionType);
  }

  private updateActiveCharacters(state: BattleState | null): void {
    if (!state) {
      this.character1 = null;
      this.character2 = null;
      return;
    }

    this.character1 = state.team1[state.activeTeam1Index] || null;
    this.character2 = state.team2[state.activeTeam2Index] || null;
  }
}
