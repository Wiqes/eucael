import { inject, Injectable } from '@angular/core';
import { BattleCharacter, BattleAction, BattleState } from '../battle.model';
import { Subject } from 'rxjs';
import { BattleEffectsService } from './battle-effects.service';

@Injectable({
  providedIn: 'root',
})
export class BattleRacialSkillsService {
  private readonly effectsService = inject(BattleEffectsService);
  private readonly poisonBaseChance = 20;
  private readonly poisonFocusFactor = 0.5;
  private readonly poisonSpeedFactor = 0.3;
  private readonly poisonAttackFactor = 0.3;
  private readonly poisonFocusDamageFactor = 0.5;
  private readonly poisonTurns = 4;
  private readonly comboBaseChance = 25;
  private readonly comboSpeedFactor = 0.6;
  private readonly comboDamageFactor = 0.6;
  private readonly comboDamageDelayMs = 500;
  private readonly debuffAttackFactor = 0.4;
  private readonly debuffAccuracyFactor = 0.3;

  applyRacialSkills(
    attacker: BattleCharacter,
    defender: BattleCharacter,
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
    onCharacterDeath: (wasTeam1: boolean) => void,
  ): void {
    switch (attacker.race) {
      case 'rat':
        this.applyPoisonBite(attacker, defender, state, actionSubject, onCharacterDeath);
        break;
      case 'cat':
        this.applyComboStrike(attacker, defender, state, actionSubject);
        break;
      case 'giraffe':
        this.applyDistanceControl(attacker, defender);
        break;
    }
  }

  applyForcedPoison(
    attacker: BattleCharacter,
    defender: BattleCharacter,
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
    onCharacterDeath: (wasTeam1: boolean) => void,
  ): void {
    const poisonDamage =
      attacker.attack * this.poisonAttackFactor + attacker.focus * this.poisonFocusDamageFactor;

    defender.poisonEffect = {
      turnsRemaining: this.poisonTurns,
      damagePerTurn: Math.floor(poisonDamage),
    };

    this.emitAction(state, actionSubject, {
      attackerId: attacker.id,
      defenderId: defender.id,
      damage: 0,
      type: 'poison',
      timestamp: Date.now(),
      message: `${defender.name} is poisoned!`,
    });

    this.effectsService.startAutonomousPoisonTicks(
      defender,
      state,
      actionSubject,
      onCharacterDeath,
    );
  }

  applyForcedCombo(
    attacker: BattleCharacter,
    defender: BattleCharacter,
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
    onAfterDamage?: () => void,
  ): void {
    const comboDamage = Math.floor(attacker.attack * this.comboDamageFactor);

    this.emitAction(state, actionSubject, {
      attackerId: attacker.id,
      defenderId: defender.id,
      damage: comboDamage,
      type: 'combo',
      timestamp: Date.now(),
      message: `${attacker.name} combo strike!`,
    });

    setTimeout(() => {
      defender.health = Math.max(0, defender.health - comboDamage);
      defender.isAlive = defender.health > 0;
      onAfterDamage?.();
    }, this.comboDamageDelayMs);
  }

  private applyPoisonBite(
    attacker: BattleCharacter,
    defender: BattleCharacter,
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
    onCharacterDeath: (wasTeam1: boolean) => void,
  ): void {
    // Poison chance = 20% + (FOCUS × 0.5%) + (SPD × 0.3%)
    const poisonChance =
      this.poisonBaseChance +
      attacker.focus * this.poisonFocusFactor +
      attacker.speed * this.poisonSpeedFactor;

    if (Math.random() * 100 < poisonChance) {
      // Poison damage = ATK × 0.3 + FOCUS × 0.5
      const poisonDamage =
        attacker.attack * this.poisonAttackFactor + attacker.focus * this.poisonFocusDamageFactor;

      defender.poisonEffect = {
        turnsRemaining: this.poisonTurns,
        damagePerTurn: Math.floor(poisonDamage),
      };

      this.emitAction(state, actionSubject, {
        attackerId: attacker.id,
        defenderId: defender.id,
        damage: 0,
        type: 'poison',
        timestamp: Date.now(),
        message: `${defender.name} is poisoned!`,
      });

      this.effectsService.startAutonomousPoisonTicks(
        defender,
        state,
        actionSubject,
        onCharacterDeath,
      );
    }
  }

  private applyComboStrike(
    attacker: BattleCharacter,
    defender: BattleCharacter,
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
  ): void {
    // Second hit chance = 25% + (SPD × 0.6%)
    const comboChance = this.comboBaseChance + attacker.speed * this.comboSpeedFactor;

    if (Math.random() * 100 < comboChance) {
      // Second hit = ATK × 0.6
      const comboDamage = Math.floor(attacker.attack * this.comboDamageFactor);

      this.emitAction(state, actionSubject, {
        attackerId: attacker.id,
        defenderId: defender.id,
        damage: comboDamage,
        type: 'combo',
        timestamp: Date.now(),
        message: `${attacker.name} combo strike!`,
      });

      // Apply combo damage after a short delay
      setTimeout(() => {
        defender.health = Math.max(0, defender.health - comboDamage);
        defender.isAlive = defender.health > 0;
      }, this.comboDamageDelayMs);
    }
  }

  private applyDistanceControl(attacker: BattleCharacter, defender: BattleCharacter): void {
    // Attack reduction = FOCUS × 0.4
    const attackReduction = attacker.focus * this.debuffAttackFactor;
    // Accuracy reduction = FOCUS × 0.3%
    const accuracyReduction = attacker.focus * this.debuffAccuracyFactor;

    defender.debuffEffect = {
      attackReduction: attackReduction,
      accuracyReduction: accuracyReduction,
    };
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
