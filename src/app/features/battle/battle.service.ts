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
    team1: Omit<BattleCharacter, 'isAlive' | 'position' | 'turnCount'>[],
    team2: Omit<BattleCharacter, 'isAlive' | 'position' | 'turnCount'>[],
  ): void {
    if (team1.length === 0 || team2.length === 0) {
      throw new Error('Both teams must have at least one character');
    }

    const prepareTeam = (
      team: Omit<BattleCharacter, 'isAlive' | 'position' | 'turnCount'>[],
      position: { x: number; y: number; z: number },
    ): BattleCharacter[] => {
      return team.map((char) => ({
        ...char,
        isAlive: true,
        position,
        turnCount: 0,
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

    // Determine who goes first based on initiative
    const initiative1 = this.calculateInitiative(activeChar1);
    const initiative2 = this.calculateInitiative(activeChar2);

    const firstAttacker = initiative1 >= initiative2 ? activeChar1 : activeChar2;
    const firstDefender = initiative1 >= initiative2 ? activeChar2 : activeChar1;

    // Execute first attack
    this.executeAttack(firstAttacker, firstDefender, state);

    // Check if defender is still alive for counter-attack
    setTimeout(() => {
      const currentState = this.battleStateSubject.value;
      if (!currentState || currentState.isComplete) return;

      if (firstDefender.isAlive) {
        this.executeAttack(firstDefender, firstAttacker, currentState);
      }

      // Apply end-of-turn effects after both attacks
      setTimeout(() => {
        this.applyEndOfTurnEffects();
      }, 500);
    }, 1000);
  }

  private calculateInitiative(character: BattleCharacter): number {
    // Initiative = SPD + random(0–10)
    return character.speed + Math.floor(Math.random() * 11);
  }

  private calculateHitChance(attacker: BattleCharacter, defender: BattleCharacter): number {
    // HitChance = 75% + (Attacker.SPD − Defender.SPD) × 0.5%
    let hitChance = 75 + (attacker.speed - defender.speed) * 0.5;

    // Apply debuff if attacker has accuracy reduction
    if (attacker.debuffEffect) {
      hitChance -= attacker.debuffEffect.accuracyReduction;
    }

    return Math.max(5, Math.min(100, hitChance)); // Clamp between 5% and 100%
  }

  private calculateBaseDamage(attacker: BattleCharacter, defender: BattleCharacter): number {
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

  private calculateCritChance(attacker: BattleCharacter): number {
    // CritChance = 5% + (SPD × 0.2%)
    return 5 + attacker.speed * 0.2;
  }

  private executeAttack(
    attacker: BattleCharacter,
    defender: BattleCharacter,
    state: BattleState,
  ): void {
    attacker.turnCount++;

    // Check hit chance
    const hitChance = this.calculateHitChance(attacker, defender);
    const hitRoll = Math.random() * 100;

    if (hitRoll > hitChance) {
      // Miss
      const action: BattleAction = {
        attackerId: attacker.id,
        defenderId: defender.id,
        damage: 0,
        type: 'miss',
        timestamp: Date.now(),
        message: `${attacker.name} missed!`,
      };
      state.actions.push(action);
      this.actionSubject.next(action);
      this.battleStateSubject.next({ ...state });
      return;
    }

    // Calculate damage
    let finalDamage = this.calculateBaseDamage(attacker, defender);

    // Check for critical hit
    const critChance = this.calculateCritChance(attacker);
    const isCritical = Math.random() * 100 < critChance;
    if (isCritical) {
      finalDamage *= 1.5;
    }

    finalDamage = Math.floor(finalDamage);

    // Apply racial skills
    this.applyRacialSkills(attacker, defender, state);

    // Create action
    const action: BattleAction = {
      attackerId: attacker.id,
      defenderId: defender.id,
      damage: finalDamage,
      type: isCritical ? 'critical' : 'attack',
      timestamp: Date.now(),
    };

    state.actions.push(action);
    this.actionSubject.next(action);

    // Apply damage with delay
    setTimeout(() => {
      const currentState = this.battleStateSubject.value;
      if (!currentState || currentState.isComplete) return;

      defender.health = Math.max(0, defender.health - finalDamage);
      defender.isAlive = defender.health > 0;

      this.battleStateSubject.next({ ...currentState });

      if (!defender.isAlive) {
        setTimeout(() => {
          this.handleCharacterDeath(attacker === currentState.team1[currentState.activeTeam1Index]);
        }, 1500);
      }
    }, 350);
  }

  private applyRacialSkills(
    attacker: BattleCharacter,
    defender: BattleCharacter,
    state: BattleState,
  ): void {
    switch (attacker.race) {
      case 'rat':
        this.applyPoisonBite(attacker, defender, state);
        break;
      case 'cat':
        this.applyComboStrike(attacker, defender, state);
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
      this.actionSubject.next(action);
    }
  }

  private applyComboStrike(
    attacker: BattleCharacter,
    defender: BattleCharacter,
    state: BattleState,
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
      this.actionSubject.next(action);

      // Apply combo damage after a short delay
      setTimeout(() => {
        const currentState = this.battleStateSubject.value;
        if (!currentState || currentState.isComplete) return;

        defender.health = Math.max(0, defender.health - comboDamage);
        defender.isAlive = defender.health > 0;

        this.battleStateSubject.next({ ...currentState });
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

  private applyEndOfTurnEffects(): void {
    const state = this.battleStateSubject.value;
    if (!state || state.isComplete) return;

    // Apply poison damage
    [state.team1[state.activeTeam1Index], state.team2[state.activeTeam2Index]].forEach((char) => {
      if (char && char.poisonEffect && char.isAlive) {
        const poisonDamage = char.poisonEffect.damagePerTurn;
        char.health = Math.max(0, char.health - poisonDamage);
        char.isAlive = char.health > 0;

        const action: BattleAction = {
          attackerId: '',
          defenderId: char.id,
          damage: poisonDamage,
          type: 'poison',
          timestamp: Date.now(),
          message: `${char.name} takes poison damage!`,
        };
        state.actions.push(action);
        this.actionSubject.next(action);

        char.poisonEffect.turnsRemaining--;
        if (char.poisonEffect.turnsRemaining <= 0) {
          delete char.poisonEffect;
        }

        if (!char.isAlive) {
          setTimeout(() => {
            this.handleCharacterDeath(char === state.team1[state.activeTeam1Index]);
          }, 1000);
        }
      }
    });

    this.battleStateSubject.next({ ...state });
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
