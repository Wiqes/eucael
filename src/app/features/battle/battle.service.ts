import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable, takeWhile } from 'rxjs';
import { BattleCharacter, BattleAction, BattleState, Position3d } from './battle.model';
import { BattleTurnService } from './services/battle-turn.service';

@Injectable({
  providedIn: 'root',
})
export class BattleService {
  private readonly turnService = inject(BattleTurnService);
  private readonly autoPlayIntervalMs = 4000;
  private readonly team1StartPosition: Position3d = { x: -2, y: 0.35, z: 3 };
  private readonly team2StartPosition: Position3d = { x: 3, y: 0.35, z: -3 };

  private readonly battleStateSubject = new BehaviorSubject<BattleState | null>(null);
  readonly battleState$: Observable<BattleState | null> = this.battleStateSubject.asObservable();

  private readonly actionSubject = new BehaviorSubject<BattleAction | null>(null);
  readonly action$: Observable<BattleAction | null> = this.actionSubject.asObservable();

  startBattle(
    team1: Omit<BattleCharacter, 'isAlive' | 'position' | 'turnCount'>[],
    team2: Omit<BattleCharacter, 'isAlive' | 'position' | 'turnCount'>[],
  ): void {
    if (team1.length === 0 || team2.length === 0) {
      throw new Error('Both teams must have at least one character');
    }

    const initialState: BattleState = {
      team1: this.prepareTeam(team1, this.team1StartPosition),
      team2: this.prepareTeam(team2, this.team2StartPosition),
      activeTeam1Index: 0,
      activeTeam2Index: 0,
      actions: [],
      winner: null,
      isComplete: false,
    };

    this.battleStateSubject.next(initialState);

    // Auto-play battle with turns
    this.executeAutoPlay();
  }

  private executeAutoPlay(): void {
    interval(this.autoPlayIntervalMs)
      .pipe(
        takeWhile(() => {
          const state = this.battleStateSubject.value;
          return state !== null && !state.isComplete;
        }),
      )
      .subscribe(() => {
        this.executeTurn();
      });
  }

  private executeTurn(): void {
    const state = this.battleStateSubject.value;
    if (!state) return;

    this.turnService.executeTurn(
      state,
      this.actionSubject,
      () => this.endBattle(),
      (wasTeam1Attacking: boolean) => this.handleCharacterDeath(wasTeam1Attacking),
    );

    this.battleStateSubject.next({ ...state });
  }

  private handleCharacterDeath(wasTeam1Attacking: boolean): void {
    const state = this.battleStateSubject.value;
    if (!state || state.isComplete) return;

    // Determine which team lost a character
    const defeatedTeamIndex = wasTeam1Attacking ? 'team2' : 'team1';
    const activeIndexKey = wasTeam1Attacking ? 'activeTeam2Index' : 'activeTeam1Index';
    const team = state[defeatedTeamIndex];
    const currentIndex = state[activeIndexKey];

    // Move to the next alive character if available
    const nextAliveIndex = this.getNextAliveIndex(team, currentIndex);
    if (nextAliveIndex !== null) {
      state[activeIndexKey] = nextAliveIndex;
      this.battleStateSubject.next({ ...state });
      return;
    }

    // No alive characters available for the defeated team, end battle
    this.endBattle();
  }

  private getNextAliveIndex(team: BattleCharacter[], currentIndex: number): number | null {
    const forwardIndex = team.findIndex((char, index) => index > currentIndex && char.isAlive);
    if (forwardIndex !== -1) {
      return forwardIndex;
    }

    const anyAliveIndex = team.findIndex((char) => char.isAlive);
    return anyAliveIndex !== -1 ? anyAliveIndex : null;
  }

  private endBattle(): void {
    const state = this.battleStateSubject.value;
    if (!state) return;

    state.isComplete = true;

    // Determine winning team
    const team1HasSurvivors = state.team1.some((char) => char.isAlive);
    const winningTeam = team1HasSurvivors ? state.team1 : state.team2;
    const aliveCharacters = winningTeam.filter((char) => char.isAlive);

    // Set winner to the first alive character's name or team indicator
    state.winner = aliveCharacters.length > 0 ? aliveCharacters[0].name : null;

    this.battleStateSubject.next({ ...state });
  }

  resetBattle(): void {
    this.battleStateSubject.next(null);
    this.actionSubject.next(null);
  }

  private prepareTeam(
    team: Omit<BattleCharacter, 'isAlive' | 'position' | 'turnCount'>[],
    position: Position3d,
  ): BattleCharacter[] {
    return team.map((char) => ({
      ...char,
      isAlive: true,
      position,
      turnCount: 0,
    }));
  }
}
