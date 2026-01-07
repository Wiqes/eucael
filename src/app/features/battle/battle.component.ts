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
      [
        {
          id: 'char1',
          name: 'Celestial Guardian',
          health: 220,
          maxHealth: 220,
          defense: 28,
          attack: 48,
          color: '#ff6b6b',
        },
      ],
      [
        {
          id: 'char2',
          name: 'Azure Sentinel',
          health: 110,
          maxHealth: 110,
          defense: 22,
          attack: 26,
          color: '#4ecdc4',
        },
        {
          id: 'char3',
          name: 'Blue Spider',
          health: 122,
          maxHealth: 122,
          defense: 23,
          attack: 26,
          color: '#0000ff',
        },
      ],
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
