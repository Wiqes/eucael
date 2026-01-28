import { Injectable } from '@angular/core';
import { BattleCharacter } from '../battle.model';

@Injectable({
  providedIn: 'root',
})
export class BattleDamageService {
  private readonly baseHitChance = 75;
  private readonly hitChanceSpeedFactor = 0.5;
  private readonly minHitChance = 5;
  private readonly maxHitChance = 100;
  private readonly critBaseChance = 5;
  private readonly critSpeedFactor = 0.2;
  private readonly bearRageThreshold = 0.5;
  private readonly bearRageAttackFactor = 0.05;
  private readonly bearRageDefenseFactor = 0.3;
  private readonly horseRushSpeedFactor = 0.01;
  private readonly defenseMultiplier = 0.6;
  private readonly minDamage = 1;

  calculateHitChance(attacker: BattleCharacter, defender: BattleCharacter): number {
    // HitChance = 75% + (Attacker.SPD − Defender.SPD) × 0.5%
    let hitChance =
      this.baseHitChance + (attacker.speed - defender.speed) * this.hitChanceSpeedFactor;

    // Apply debuff if attacker has accuracy reduction
    if (attacker.debuffEffect) {
      hitChance -= attacker.debuffEffect.accuracyReduction;
    }

    return Math.max(this.minHitChance, Math.min(this.maxHitChance, hitChance));
  }

  calculateBaseDamage(attacker: BattleCharacter, defender: BattleCharacter): number {
    let attack = attacker.attack;

    // Apply debuff if attacker has attack reduction
    if (attacker.debuffEffect) {
      attack -= attacker.debuffEffect.attackReduction;
    }

    // Bear - Survival Rage (when HP < 50%)
    if (attacker.race === 'bear' && attacker.health < attacker.maxHealth * this.bearRageThreshold) {
      const attackBonus = (attacker.maxHealth - attacker.health) * this.bearRageAttackFactor;
      attack += attackBonus;
    }

    // Horse - Rush (first turn bonus)
    let damageMultiplier = 1;
    if (attacker.race === 'horse' && attacker.turnCount === 0) {
      damageMultiplier = 0.5 + attacker.speed * this.horseRushSpeedFactor;
    }

    // BaseDamage = ATK − (DEF × 0.6)
    let defense = defender.defense;

    // Bear - Survival Rage defense bonus
    if (defender.race === 'bear' && defender.health < defender.maxHealth * this.bearRageThreshold) {
      defense += defender.defense * this.bearRageDefenseFactor;
    }

    const baseDamage = attack * damageMultiplier - defense * this.defenseMultiplier;

    // FinalDamage = max(1, BaseDamage)
    return Math.max(this.minDamage, baseDamage);
  }

  calculateCritChance(attacker: BattleCharacter): number {
    // CritChance = 5% + (SPD × 0.2%)
    return this.critBaseChance + attacker.speed * this.critSpeedFactor;
  }

  isCriticalHit(critChance: number): boolean {
    return Math.random() * 100 < critChance;
  }

  isHit(hitChance: number): boolean {
    return Math.random() * 100 <= hitChance;
  }
}
