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
    character1: Omit<BattleCharacter, 'isAlive' | 'position'>,
    character2: Omit<BattleCharacter, 'isAlive' | 'position'>,
  ): void {
    const char1: BattleCharacter = {
      ...character1,
      isAlive: true,
      position: { x: -3, y: 0, z: 3 },
    };

    const char2: BattleCharacter = {
      ...character2,
      isAlive: true,
      position: { x: 3, y: 0, z: -3 },
    };

    const initialState: BattleState = {
      character1: char1,
      character2: char2,
      actions: [],
      winner: null,
      isComplete: false,
    };

    this.battleStateSubject.next(initialState);

    // Auto-play battle with turns
    //this.executeAutoPlay();
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

    // Alternate turns
    const isChar1Turn = state.actions.length % 2 === 0;
    const attacker = isChar1Turn ? state.character1 : state.character2;
    const defender = isChar1Turn ? state.character2 : state.character1;

    if (!attacker.isAlive || !defender.isAlive) {
      this.endBattle();
      return;
    }

    // Calculate damage
    const baseDamage = attacker.attack;
    const defenseMitigation = defender.defense * 0.5;
    const isCritical = Math.random() > 0.7;
    const criticalMultiplier = isCritical ? 2 : 1;
    const isBlocked = Math.random() > 0.8;

    let finalDamage = Math.max(
      1,
      Math.floor((baseDamage - defenseMitigation) * criticalMultiplier),
    );
    if (isBlocked) finalDamage = Math.floor(finalDamage * 0.3);

    // Apply damage
    defender.health = Math.max(0, defender.health - finalDamage);
    defender.isAlive = defender.health > 0;

    // Create action
    const action: BattleAction = {
      attackerId: attacker.id,
      defenderId: defender.id,
      damage: finalDamage,
      type: isBlocked ? 'blocked' : isCritical ? 'critical' : 'attack',
      timestamp: Date.now(),
    };

    state.actions.push(action);
    this.actionSubject.next(action);
    this.battleStateSubject.next({ ...state });

    // Check for winner
    if (!defender.isAlive) {
      this.endBattle();
    }
  }

  private endBattle(): void {
    const state = this.battleStateSubject.value;
    if (!state) return;

    state.isComplete = true;
    state.winner = state.character1.isAlive ? state.character1.name : state.character2.name;
    this.battleStateSubject.next({ ...state });
  }

  resetBattle(): void {
    this.battleStateSubject.next(null);
    this.actionSubject.next(null);
  }
}
