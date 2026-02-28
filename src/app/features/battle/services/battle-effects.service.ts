import { Injectable } from '@angular/core';
import { BattleCharacter, BattleAction, BattleState } from '../battle.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BattleEffectsService {
  private readonly poisonDeathDelayMs = 1000;
  private readonly poisonTickIntervalMs = 3000;
  private readonly poisonTickCount = 4;
  private poisonTimers = new Map<string, ReturnType<typeof setTimeout>[]>();

  applyEndOfTurnEffects(
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
    onCharacterDeath: (wasTeam1: boolean) => void,
  ): void {
    if (!state || state.isComplete) return;
    // Poison damage is now handled autonomously via startAutonomousPoisonTicks
  }

  startAutonomousPoisonTicks(
    character: BattleCharacter,
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
    onCharacterDeath: (wasTeam1: boolean) => void,
  ): void {
    // Clear any existing timers for this character
    this.clearPoisonTimersForCharacter(character.id);

    const isTeam1 = state.team1.some((c) => c.id === character.id);
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let i = 0; i < this.poisonTickCount; i++) {
      const timer = setTimeout(
        () => {
          this.applyPoisonDamage(character, state, actionSubject, isTeam1, onCharacterDeath);
        },
        (i + 1) * this.poisonTickIntervalMs,
      );
      timers.push(timer);
    }

    this.poisonTimers.set(character.id, timers);
  }

  clearPoisonTimersForCharacter(characterId: string): void {
    const timers = this.poisonTimers.get(characterId);
    if (timers) {
      timers.forEach((t) => clearTimeout(t));
      this.poisonTimers.delete(characterId);
    }
  }

  clearAllPoisonTimers(): void {
    this.poisonTimers.forEach((timers) => timers.forEach((t) => clearTimeout(t)));
    this.poisonTimers.clear();
  }

  private applyPoisonDamage(
    character: BattleCharacter,
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
    isTeam1: boolean,
    onCharacterDeath: (wasTeam1: boolean) => void,
  ): void {
    if (!character || !character.poisonEffect || !character.isAlive) return;
    if (state.isComplete) return;

    const poisonDamage = character.poisonEffect.damagePerTurn;
    character.health = Math.max(0, character.health - poisonDamage);
    character.isAlive = character.health > 0;

    this.emitAction(state, actionSubject, {
      attackerId: '',
      defenderId: character.id,
      damage: poisonDamage,
      type: 'poison',
      timestamp: Date.now(),
      message: `${character.name} takes poison damage!`,
    });

    character.poisonEffect.turnsRemaining--;
    if (character.poisonEffect.turnsRemaining <= 0) {
      delete character.poisonEffect;
      this.clearPoisonTimersForCharacter(character.id);
    }

    if (!character.isAlive) {
      this.clearPoisonTimersForCharacter(character.id);
      setTimeout(() => {
        onCharacterDeath(!isTeam1);
      }, this.poisonDeathDelayMs);
    }
  }

  private emitAction(
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
    action: BattleAction,
  ): void {
    state.actions.push(action);
    actionSubject.next(action);
  }
}
