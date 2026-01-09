import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattleService } from './battle.service';
import { BattleCharacter } from './battle.model';
import { Subject, takeUntil } from 'rxjs';
import { CharacterStatusCardComponent } from './character-status-card/character-status-card.component';
import { BattleVsBadgeComponent } from './battle-vs-badge/battle-vs-badge.component';
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
    BattleVsBadgeComponent,
    VictoryBannerComponent,
    BattleControlsComponent,
    BattleCanvasComponent,
  ],
  templateUrl: './battle.component.html',
  styleUrls: ['./battle.component.scss'],
})
export class BattleComponent implements OnInit, OnDestroy {
  @ViewChild(BattleCanvasComponent) battleCanvas!: BattleCanvasComponent;

  private destroy$ = new Subject<void>();
  private battleService = inject(BattleService);
  private router = inject(Router);

  battleState$ = this.battleService.battleState$;
  character1: BattleCharacter | null = null;
  character2: BattleCharacter | null = null;

  ngOnInit(): void {
    this.battleService.battleState$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      if (state) {
        this.character1 = state.team1[state.activeTeam1Index] || null;
        this.character2 = state.team2[state.activeTeam2Index] || null;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startBattle(): void {
    this.battleService.startBattle(
      [BATTLE_CHARACTERS['RAT'], BATTLE_CHARACTERS['HORSE'], BATTLE_CHARACTERS['CAT']],
      [BATTLE_CHARACTERS['BEAR'], BATTLE_CHARACTERS['GIRAFFE']],
    );
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
}
