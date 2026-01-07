import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable, takeWhile } from 'rxjs';
import { BattleCharacter, BattleAction, BattleState } from './battle.model';

@Injectable({
  providedIn: 'root',
})
export class BattleService {
  private battleStateSubject = new BehaviorSubject<BattleState | null>(null);
  public battleState$: Observable<BattleState | null> = this.battleStateSubject.asObservable();

  private actionSubject = new BehaviorSubject<BattleAction | null>(null);
  public action$: Observable<BattleAction | null> = this.actionSubject.asObservable();

  startBattle(
    team1: Omit<BattleCharacter, 'isAlive' | 'position'>[],
    team2: Omit<BattleCharacter, 'isAlive' | 'position'>[],
  ): void {
    if (team1.length === 0 || team2.length === 0) {
      throw new Error('Both teams must have at least one character');
    }

    const prepareTeam = (
      team: Omit<BattleCharacter, 'isAlive' | 'position'>[],
      position: { x: number; y: number; z: number },
    ): BattleCharacter[] => {
      return team.map((char) => ({
        ...char,
        isAlive: true,
        position,
      }));
    };

    const initialState: BattleState = {
      team1: prepareTeam(team1, { x: -2, y: 0.5, z: 3 }),
      team2: prepareTeam(team2, { x: 3, y: 0.5, z: -3 }),
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
    interval(2000)
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
    if (!state || state.isComplete) return;

    // Get active characters
    const activeChar1 = state.team1[state.activeTeam1Index];
    const activeChar2 = state.team2[state.activeTeam2Index];

    if (!activeChar1 || !activeChar2) {
      this.endBattle();
      return;
    }

    // Alternate turns
    const isTeam1Turn = state.actions.length % 2 === 0;
    const attacker = isTeam1Turn ? activeChar1 : activeChar2;
    const defender = isTeam1Turn ? activeChar2 : activeChar1;

    if (!attacker.isAlive || !defender.isAlive) {
      this.endBattle();
      return;
    }

    // Calculate damage
    const baseDamage = attacker.attack;
    const defenseMitigation = defender.defense * 0.5;
    const isCritical = Math.random() > 0.5;
    const criticalMultiplier = isCritical ? 2 : 1;
    const isBlocked = Math.random() > 0.5;

    let finalDamage = Math.max(
      1,
      Math.floor((baseDamage - defenseMitigation) * criticalMultiplier),
    );
    if (isBlocked) finalDamage = Math.floor(finalDamage * 0.3);

    // Create action BEFORE applying damage
    const action: BattleAction = {
      attackerId: attacker.id,
      defenderId: defender.id,
      damage: finalDamage,
      type: isBlocked ? 'blocked' : isCritical ? 'critical' : 'attack',
      timestamp: Date.now(),
    };

    state.actions.push(action);
    this.actionSubject.next(action);

    // Delay health update to sync with attack animation impact
    setTimeout(() => {
      const currentState = this.battleStateSubject.value;
      if (!currentState || currentState.isComplete) return;

      // Apply damage
      defender.health = Math.max(0, defender.health - finalDamage);
      defender.isAlive = defender.health > 0;

      this.battleStateSubject.next({ ...currentState });

      // Check if defender died and needs to be replaced
      if (!defender.isAlive) {
        setTimeout(() => {
          this.handleCharacterDeath(isTeam1Turn);
        }, 1500); // Additional delay for complete attack animation sequence
      }
    }, 350); // Delay matches the attack impact timing in animation
  }

  private handleCharacterDeath(wasTeam1Attacking: boolean): void {
    const state = this.battleStateSubject.value;
    if (!state || state.isComplete) return;

    // Determine which team lost a character
    const defeatedTeamIndex = wasTeam1Attacking ? 'team2' : 'team1';
    const activeIndexKey = wasTeam1Attacking ? 'activeTeam2Index' : 'activeTeam1Index';
    const team = state[defeatedTeamIndex];
    const currentIndex = state[activeIndexKey];

    // Check if there's a next character available
    const nextIndex = currentIndex + 1;
    if (nextIndex < team.length) {
      // Bring in the next character
      state[activeIndexKey] = nextIndex;
      this.battleStateSubject.next({ ...state });
    } else {
      // No more characters available, end battle
      this.endBattle();
    }
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
}
