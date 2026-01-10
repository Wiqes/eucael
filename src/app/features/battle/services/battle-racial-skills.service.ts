import { Injectable } from '@angular/core';
import { BattleCharacter, BattleAction, BattleState } from '../battle.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BattleRacialSkillsService {
  applyRacialSkills(
    attacker: BattleCharacter,
    defender: BattleCharacter,
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
  ): void {
    switch (attacker.race) {
      case 'rat':
        this.applyPoisonBite(attacker, defender, state, actionSubject);
        break;
      case 'cat':
        this.applyComboStrike(attacker, defender, state, actionSubject);
        break;
      case 'giraffe':
        this.applyDistanceControl(attacker, defender);
        break;
    }
  }

  private applyPoisonBite(
    attacker: BattleCharacter,
    defender: BattleCharacter,
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
  ): void {
    // Poison chance = 20% + (FOCUS × 0.5%) + (SPD × 0.3%)
    const poisonChance = 20 + attacker.focus * 0.5 + attacker.speed * 0.3;

    if (Math.random() * 100 < poisonChance) {
      // Poison damage = ATK × 0.3 + FOCUS × 0.5
      const poisonDamage = attacker.attack * 0.3 + attacker.focus * 0.5;

      defender.poisonEffect = {
        turnsRemaining: 3,
        damagePerTurn: Math.floor(poisonDamage),
      };

      const action: BattleAction = {
        attackerId: attacker.id,
        defenderId: defender.id,
        damage: 0,
        type: 'poison',
        timestamp: Date.now(),
        message: `${defender.name} is poisoned!`,
      };
      state.actions.push(action);
      actionSubject.next(action);
    }
  }

  private applyComboStrike(
    attacker: BattleCharacter,
    defender: BattleCharacter,
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
  ): void {
    // Second hit chance = 25% + (SPD × 0.6%)
    const comboChance = 25 + attacker.speed * 0.6;

    if (Math.random() * 100 < comboChance) {
      // Second hit = ATK × 0.6
      const comboDamage = Math.floor(attacker.attack * 0.6);

      const action: BattleAction = {
        attackerId: attacker.id,
        defenderId: defender.id,
        damage: comboDamage,
        type: 'combo',
        timestamp: Date.now(),
        message: `${attacker.name} combo strike!`,
      };
      state.actions.push(action);
      actionSubject.next(action);

      // Apply combo damage after a short delay
      setTimeout(() => {
        defender.health = Math.max(0, defender.health - comboDamage);
        defender.isAlive = defender.health > 0;
      }, 500);
    }
  }

  private applyDistanceControl(attacker: BattleCharacter, defender: BattleCharacter): void {
    // Attack reduction = FOCUS × 0.4
    const attackReduction = attacker.focus * 0.4;
    // Accuracy reduction = FOCUS × 0.3%
    const accuracyReduction = attacker.focus * 0.3;

    defender.debuffEffect = {
      attackReduction: attackReduction,
      accuracyReduction: accuracyReduction,
    };
  }
}
