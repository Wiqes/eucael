import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  BattleCharacter,
  BattleAction,
  BattleActionType,
  BattleState,
  Position3d,
} from './battle.model';
import { BattleTurnService } from './services/battle-turn.service';

@Injectable({
  providedIn: 'root',
})
export class BattleService {
  private readonly turnService = inject(BattleTurnService);
  private readonly team1StartPosition: Position3d = { x: -2, y: 0.95, z: 3 };
  private readonly team2StartPosition: Position3d = { x: 3, y: 0.95, z: -3 };

  private readonly battleStateSubject = new BehaviorSubject<BattleState | null>(null);
  readonly battleState$: Observable<BattleState | null> = this.battleStateSubject.asObservable();

  private readonly awaitingPlayerActionSubject = new BehaviorSubject<boolean>(false);
  readonly awaitingPlayerAction$: Observable<boolean> =
    this.awaitingPlayerActionSubject.asObservable();

  private readonly actionSubject = new BehaviorSubject<BattleAction | null>(null);
  readonly action$: Observable<BattleAction | null> = this.actionSubject.asObservable();

  private currentTurn: {
    team1: BattleCharacter;
    team2: BattleCharacter;
    firstAttackerIsTeam1: boolean;
  } | null = null;
  private awaitingPlayerPhase: 'first' | 'second' | null = null;

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

    this.awaitingPlayerActionSubject.next(false);
    this.currentTurn = null;
    this.awaitingPlayerPhase = null;

    this.beginNextTurn();
  }

  performPlayerAction(actionType: BattleActionType): void {
    const state = this.battleStateSubject.value;
    if (!state || state.isComplete || !this.currentTurn || !this.awaitingPlayerPhase) return;

    const { team1, team2 } = this.currentTurn;

    this.awaitingPlayerActionSubject.next(false);

    this.turnService.executePlayerAttack(
      team1,
      team2,
      state,
      this.actionSubject,
      (wasTeam1Attacking: boolean) => this.handleCharacterDeath(wasTeam1Attacking),
      actionType,
    );

    this.battleStateSubject.next({ ...state });

    if (this.awaitingPlayerPhase === 'first') {
      setTimeout(() => {
        const activeState = this.battleStateSubject.value;
        if (!activeState || activeState.isComplete) return;

        if (team2.isAlive) {
          this.turnService.executeAutoAttack(
            team2,
            team1,
            activeState,
            this.actionSubject,
            (wasTeam1Attacking: boolean) => this.handleCharacterDeath(wasTeam1Attacking),
          );
          this.battleStateSubject.next({ ...activeState });
        }

        this.finalizeTurn();
      }, this.turnService.getCounterAttackDelayMs());
    } else {
      this.finalizeTurn();
    }

    this.awaitingPlayerPhase = null;
  }

  private beginNextTurn(): void {
    const state = this.battleStateSubject.value;
    if (!state || state.isComplete) return;

    const activeTeam1 = state.team1[state.activeTeam1Index];
    const activeTeam2 = state.team2[state.activeTeam2Index];

    if (!activeTeam1 || !activeTeam2) {
      this.endBattle();
      return;
    }

    const turnOrder = this.turnService.getTurnOrder(activeTeam1, activeTeam2);
    this.currentTurn = {
      team1: activeTeam1,
      team2: activeTeam2,
      firstAttackerIsTeam1: turnOrder.firstAttackerIsTeam1,
    };

    if (turnOrder.firstAttackerIsTeam1) {
      this.awaitingPlayerPhase = 'first';
      this.awaitingPlayerActionSubject.next(true);
      return;
    }

    this.turnService.executeAutoAttack(
      turnOrder.firstAttacker,
      turnOrder.firstDefender,
      state,
      this.actionSubject,
      (wasTeam1Attacking: boolean) => this.handleCharacterDeath(wasTeam1Attacking),
    );

    this.battleStateSubject.next({ ...state });

    this.awaitingPlayerPhase = 'second';
    setTimeout(() => {
      const activeState = this.battleStateSubject.value;
      if (!activeState || activeState.isComplete) return;
      if (!this.currentTurn?.team1.isAlive) {
        this.finalizeTurn();
        return;
      }
      this.awaitingPlayerActionSubject.next(true);
    }, this.turnService.getCounterAttackDelayMs());
  }

  private finalizeTurn(): void {
    setTimeout(() => {
      const state = this.battleStateSubject.value;
      if (!state || state.isComplete) return;

      this.turnService.applyEndOfTurnEffects(
        state,
        this.actionSubject,
        (wasTeam1Attacking: boolean) => this.handleCharacterDeath(wasTeam1Attacking),
      );

      this.battleStateSubject.next({ ...state });

      if (!state.isComplete) {
        this.beginNextTurn();
      }
    }, this.turnService.getEffectsDelayMs());
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
    this.awaitingPlayerActionSubject.next(false);
    this.currentTurn = null;
    this.awaitingPlayerPhase = null;
  }

  resetBattle(): void {
    this.battleStateSubject.next(null);
    this.actionSubject.next(null);
    this.awaitingPlayerActionSubject.next(false);
    this.currentTurn = null;
    this.awaitingPlayerPhase = null;
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
