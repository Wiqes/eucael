import { Injectable } from '@angular/core';
import { BattleCharacter } from '../battle.model';

@Injectable({
  providedIn: 'root',
})
export class BattleDamageService {
  calculateHitChance(attacker: BattleCharacter, defender: BattleCharacter): number {
    // HitChance = 75% + (Attacker.SPD − Defender.SPD) × 0.5%
    let hitChance = 75 + (attacker.speed - defender.speed) * 0.5;

    // Apply debuff if attacker has accuracy reduction
    if (attacker.debuffEffect) {
      hitChance -= attacker.debuffEffect.accuracyReduction;
    }

    return Math.max(5, Math.min(100, hitChance)); // Clamp between 5% and 100%
  }

  calculateBaseDamage(attacker: BattleCharacter, defender: BattleCharacter): number {
    let attack = attacker.attack;

    // Apply debuff if attacker has attack reduction
    if (attacker.debuffEffect) {
      attack -= attacker.debuffEffect.attackReduction;
    }

    // Bear - Survival Rage (when HP < 50%)
    if (attacker.race === 'bear' && attacker.health < attacker.maxHealth * 0.5) {
      const attackBonus = (attacker.maxHealth - attacker.health) * 0.05;
      attack += attackBonus;
    }

    // Horse - Rush (first turn bonus)
    let damageMultiplier = 1;
    if (attacker.race === 'horse' && attacker.turnCount === 0) {
      damageMultiplier = 0.5 + attacker.speed * 0.01;
    }

    // BaseDamage = ATK − (DEF × 0.6)
    let defense = defender.defense;

    // Bear - Survival Rage defense bonus
    if (defender.race === 'bear' && defender.health < defender.maxHealth * 0.5) {
      defense += defender.defense * 0.3;
    }

    const baseDamage = attack * damageMultiplier - defense * 0.6;

    // FinalDamage = max(1, BaseDamage)
    return Math.max(1, baseDamage);
  }

  calculateCritChance(attacker: BattleCharacter): number {
    // CritChance = 5% + (SPD × 0.2%)
    return 5 + attacker.speed * 0.2;
  }

  isCriticalHit(critChance: number): boolean {
    return Math.random() * 100 < critChance;
  }

  isHit(hitChance: number): boolean {
    return Math.random() * 100 <= hitChance;
  }
}
