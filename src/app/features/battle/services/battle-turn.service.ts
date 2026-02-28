import { inject, Injectable } from '@angular/core';
import { BattleCharacter, BattleAction, BattleActionType, BattleState } from '../battle.model';
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
  private readonly counterAttackDelayMs = 2000;
  private readonly effectsDelayMs = 500;
  private readonly damageApplyDelayMs = 350;
  private readonly deathNotificationDelayMs = 1500;

  getCounterAttackDelayMs(): number {
    return this.counterAttackDelayMs;
  }

  getEffectsDelayMs(): number {
    return this.effectsDelayMs;
  }

  getTurnOrder(
    team1: BattleCharacter,
    team2: BattleCharacter,
  ): {
    firstAttacker: BattleCharacter;
    firstDefender: BattleCharacter;
    firstAttackerIsTeam1: boolean;
  } {
    const initiative1 = this.initiativeService.calculateInitiative(team1);
    const initiative2 = this.initiativeService.calculateInitiative(team2);

    const firstAttackerIsTeam1 = initiative1 >= initiative2;

    return {
      firstAttacker: firstAttackerIsTeam1 ? team1 : team2,
      firstDefender: firstAttackerIsTeam1 ? team2 : team1,
      firstAttackerIsTeam1,
    };
  }

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

    const { firstAttacker, firstDefender } = this.getTurnOrder(activeChar1, activeChar2);

    // Execute first attack
    this.executeAutoAttack(firstAttacker, firstDefender, state, actionSubject, onCharacterDeath);

    // Check if defender is still alive for counter-attack
    setTimeout(() => {
      if (state.isComplete) return;

      if (firstDefender.isAlive) {
        this.executeAutoAttack(
          firstDefender,
          firstAttacker,
          state,
          actionSubject,
          onCharacterDeath,
        );
      }

      // Apply end-of-turn effects after both attacks
      setTimeout(() => {
        this.effectsService.applyEndOfTurnEffects(state, actionSubject, onCharacterDeath);
      }, this.effectsDelayMs);
    }, this.counterAttackDelayMs);
  }

  executeAutoAttack(
    attacker: BattleCharacter,
    defender: BattleCharacter,
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
    onCharacterDeath: (wasTeam1Attacking: boolean) => void,
  ): void {
    this.executeAutoAttackInternal(attacker, defender, state, actionSubject, onCharacterDeath);
  }

  executePlayerAttack(
    attacker: BattleCharacter,
    defender: BattleCharacter,
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
    onCharacterDeath: (wasTeam1Attacking: boolean) => void,
    actionType: BattleActionType,
  ): void {
    attacker.turnCount++;

    if (actionType === 'shield') {
      attacker.shieldEffect = { blocksNextAttack: true };
      this.emitAction(state, actionSubject, {
        attackerId: attacker.id,
        defenderId: defender.id,
        damage: 0,
        type: 'shield',
        timestamp: Date.now(),
        message: `${attacker.name} raised a shield!`,
      });
      return;
    }

    if (this.consumeShield(defender)) {
      this.executeMiss(attacker, defender, state, actionSubject);
      return;
    }

    if (actionType === 'miss') {
      this.executeMiss(attacker, defender, state, actionSubject);
      return;
    }

    if (actionType === 'poison') {
      this.racialSkillsService.applyForcedPoison(
        attacker,
        defender,
        state,
        actionSubject,
        onCharacterDeath,
      );
      return;
    }

    if (actionType === 'combo') {
      this.racialSkillsService.applyForcedCombo(attacker, defender, state, actionSubject, () =>
        this.handleDeathCallback(attacker, defender, state, onCharacterDeath),
      );
      return;
    }

    const baseDamage = this.damageService.calculateBaseDamage(attacker, defender);
    const finalDamage = Math.floor(actionType === 'critical' ? baseDamage * 1.5 : baseDamage);

    this.emitAction(state, actionSubject, {
      attackerId: attacker.id,
      defenderId: defender.id,
      damage: finalDamage,
      type: actionType,
      timestamp: Date.now(),
    });

    this.applyDamageWithDelay(attacker, defender, state, onCharacterDeath, finalDamage);
  }

  applyEndOfTurnEffects(
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
    onCharacterDeath: (wasTeam1Attacking: boolean) => void,
  ): void {
    this.effectsService.applyEndOfTurnEffects(state, actionSubject, onCharacterDeath);
  }

  private executeAutoAttackInternal(
    attacker: BattleCharacter,
    defender: BattleCharacter,
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
    onCharacterDeath: (wasTeam1Attacking: boolean) => void,
  ): void {
    attacker.turnCount++;

    if (this.consumeShield(defender)) {
      this.executeMiss(attacker, defender, state, actionSubject);
      return;
    }

    // Check hit chance
    const hitChance = this.damageService.calculateHitChance(attacker, defender);

    if (!this.damageService.isHit(hitChance)) {
      this.executeSkipAttack(attacker, defender, state, actionSubject);
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
    this.racialSkillsService.applyRacialSkills(
      attacker,
      defender,
      state,
      actionSubject,
      onCharacterDeath,
    );

    // Create action
    this.emitAction(state, actionSubject, {
      attackerId: attacker.id,
      defenderId: defender.id,
      damage: finalDamage,
      type: isCritical ? 'critical' : 'attack',
      timestamp: Date.now(),
    });

    this.applyDamageWithDelay(attacker, defender, state, onCharacterDeath, finalDamage);
  }

  private executeMiss(
    attacker: BattleCharacter,
    defender: BattleCharacter,
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
  ): void {
    this.emitAction(state, actionSubject, {
      attackerId: attacker.id,
      defenderId: defender.id,
      damage: 0,
      type: 'miss',
      timestamp: Date.now(),
      message: `${attacker.name} missed!`,
    });
  }

  private executeSkipAttack(
    attacker: BattleCharacter,
    defender: BattleCharacter,
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
  ): void {
    this.emitAction(state, actionSubject, {
      attackerId: attacker.id,
      defenderId: defender.id,
      damage: 0,
      type: 'skip',
      timestamp: Date.now(),
      message: `${attacker.name} skipped their turn!`,
    });
  }

  private consumeShield(defender: BattleCharacter): boolean {
    if (!defender.shieldEffect?.blocksNextAttack) return false;
    delete defender.shieldEffect;
    return true;
  }

  private emitAction(
    state: BattleState,
    actionSubject: Subject<BattleAction | null>,
    action: BattleAction,
  ): void {
    state.actions.push(action);
    actionSubject.next(action);
  }

  private applyDamageWithDelay(
    attacker: BattleCharacter,
    defender: BattleCharacter,
    state: BattleState,
    onCharacterDeath: (wasTeam1Attacking: boolean) => void,
    finalDamage: number,
  ): void {
    setTimeout(() => {
      if (state.isComplete) return;

      defender.health = Math.max(0, defender.health - finalDamage);
      defender.isAlive = defender.health > 0;

      if (!defender.isAlive) {
        setTimeout(() => {
          const wasTeam1Attacking = attacker === state.team1[state.activeTeam1Index];
          onCharacterDeath(wasTeam1Attacking);
        }, this.deathNotificationDelayMs);
      }
    }, this.damageApplyDelayMs);
  }

  private handleDeathCallback(
    attacker: BattleCharacter,
    defender: BattleCharacter,
    state: BattleState,
    onCharacterDeath: (wasTeam1Attacking: boolean) => void,
  ): void {
    if (!defender.isAlive) {
      setTimeout(() => {
        const wasTeam1Attacking = attacker === state.team1[state.activeTeam1Index];
        onCharacterDeath(wasTeam1Attacking);
      }, this.deathNotificationDelayMs);
    }
  }
}
