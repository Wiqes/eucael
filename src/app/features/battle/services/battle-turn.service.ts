import { inject, Injectable } from '@angular/core';
import { BattleCharacter, BattleAction, BattleState } from '../battle.model';
import { Subject } from 'rxjs';
import { BattleInitiativeService } from './battle-initiative.service';
import { BattleDamageService } from './battle-damage.service';
import { BattleRacialSkillsService } from './battle-racial-skills.service';
import { BattleEffectsService } from './battle-effects.service';

@Injectable({
  providedIn: 'root',
})
export class BattleTurnService {
  private readonly initiativeService = inject(BattleInitiativeService);
  private readonly damageService = inject(BattleDamageService);
  private readonly racialSkillsService = inject(BattleRacialSkillsService);
  private readonly effectsService = inject(BattleEffectsService);

  executeTurn(
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
    onEndBattle: () => void,
    onCharacterDeath: (wasTeam1Attacking: boolean) => void,
  ): void {
    if (!state || state.isComplete) return;

    // Get active characters
    const activeChar1 = state.team1[state.activeTeam1Index];
    const activeChar2 = state.team2[state.activeTeam2Index];

    if (!activeChar1 || !activeChar2) {
      onEndBattle();
      return;
    }

    // Determine who goes first based on initiative
    const initiative1 = this.initiativeService.calculateInitiative(activeChar1);
    const initiative2 = this.initiativeService.calculateInitiative(activeChar2);

    const firstAttacker = initiative1 >= initiative2 ? activeChar1 : activeChar2;
    const firstDefender = initiative1 >= initiative2 ? activeChar2 : activeChar1;

    // Execute first attack
    this.executeAttack(firstAttacker, firstDefender, state, actionSubject, onCharacterDeath);

    // Check if defender is still alive for counter-attack
    setTimeout(() => {
      if (state.isComplete) return;

      if (firstDefender.isAlive) {
        this.executeAttack(firstDefender, firstAttacker, state, actionSubject, onCharacterDeath);
      }

      // Apply end-of-turn effects after both attacks
      setTimeout(() => {
        this.effectsService.applyEndOfTurnEffects(state, actionSubject, onCharacterDeath);
      }, 500);
    }, 2000);
  }

  private executeAttack(
    attacker: BattleCharacter,
    defender: BattleCharacter,
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
    onCharacterDeath: (wasTeam1Attacking: boolean) => void,
  ): void {
    attacker.turnCount++;

    // Check hit chance
    const hitChance = this.damageService.calculateHitChance(attacker, defender);

    if (!this.damageService.isHit(hitChance)) {
      this.executeMiss(attacker, defender, state, actionSubject);
      return;
    }

    // Calculate damage
    let finalDamage = this.damageService.calculateBaseDamage(attacker, defender);

    // Check for critical hit
    const critChance = this.damageService.calculateCritChance(attacker);
    const isCritical = this.damageService.isCriticalHit(critChance);
    if (isCritical) {
      finalDamage *= 1.5;
    }

    finalDamage = Math.floor(finalDamage);

    // Apply racial skills
    this.racialSkillsService.applyRacialSkills(attacker, defender, state, actionSubject);

    // Create action
    const action: BattleAction = {
      attackerId: attacker.id,
      defenderId: defender.id,
      damage: finalDamage,
      type: isCritical ? 'critical' : 'attack',
      timestamp: Date.now(),
    };

    state.actions.push(action);
    actionSubject.next(action);

    // Apply damage with delay
    setTimeout(() => {
      if (state.isComplete) return;

      defender.health = Math.max(0, defender.health - finalDamage);
      defender.isAlive = defender.health > 0;

      if (!defender.isAlive) {
        setTimeout(() => {
          const wasTeam1Attacking = attacker === state.team1[state.activeTeam1Index];
          onCharacterDeath(wasTeam1Attacking);
        }, 1500);
      }
    }, 350);
  }

  private executeMiss(
    attacker: BattleCharacter,
    defender: BattleCharacter,
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
  ): void {
    const action: BattleAction = {
      attackerId: attacker.id,
      defenderId: defender.id,
      damage: 0,
      type: 'miss',
      timestamp: Date.now(),
      message: `${attacker.name} missed!`,
    };
    state.actions.push(action);
    actionSubject.next(action);
  }
}
