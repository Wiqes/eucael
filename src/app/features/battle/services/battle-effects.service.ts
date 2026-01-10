import { Injectable } from '@angular/core';
import { BattleCharacter, BattleAction, BattleState } from '../battle.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BattleEffectsService {
  applyEndOfTurnEffects(
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
    onCharacterDeath: (wasTeam1: boolean) => void,
  ): void {
    if (!state || state.isComplete) return;

    // Apply poison damage to active characters
    this.applyPoisonDamage(
      state.team1[state.activeTeam1Index],
      state,
      actionSubject,
      true,
      onCharacterDeath,
    );
    this.applyPoisonDamage(
      state.team2[state.activeTeam2Index],
      state,
      actionSubject,
      false,
      onCharacterDeath,
    );
  }

  private applyPoisonDamage(
    character: BattleCharacter | undefined,
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
    isTeam1: boolean,
    onCharacterDeath: (wasTeam1: boolean) => void,
  ): void {
    if (!character || !character.poisonEffect || !character.isAlive) return;

    const poisonDamage = character.poisonEffect.damagePerTurn;
    character.health = Math.max(0, character.health - poisonDamage);
    character.isAlive = character.health > 0;

    const action: BattleAction = {
      attackerId: '',
      defenderId: character.id,
      damage: poisonDamage,
      type: 'poison',
      timestamp: Date.now(),
      message: `${character.name} takes poison damage!`,
    };
    state.actions.push(action);
    actionSubject.next(action);

    character.poisonEffect.turnsRemaining--;
    if (character.poisonEffect.turnsRemaining <= 0) {
      delete character.poisonEffect;
    }

    if (!character.isAlive) {
      setTimeout(() => {
        onCharacterDeath(!isTeam1);
      }, 1000);
    }
  }
}
