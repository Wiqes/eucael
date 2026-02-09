export type BattleRace = 'rat' | 'cat' | 'bear' | 'horse' | 'giraffe';

export type BattleActionType =
  | 'attack'
  | 'critical'
  | 'miss'
  | 'poison'
  | 'skip'
  | 'combo'
  | 'shield';

export interface Position3d {
  x: number;
  y: number;
  z: number;
}

export interface PoisonEffect {
  turnsRemaining: number;
  damagePerTurn: number;
}

export interface DebuffEffect {
  attackReduction: number;
  accuracyReduction: number;
}

export interface ShieldEffect {
  blocksNextAttack: boolean;
}

export interface BattleCharacter {
  id: string;
  name: string;
  race: BattleRace;
  health: number;
  maxHealth: number;
  defense: number;
  attack: number;
  speed: number;
  focus: number;
  position: Position3d;
  color: string;
  isAlive: boolean;
  turnCount: number;
  poisonEffect?: PoisonEffect;
  debuffEffect?: DebuffEffect;
  shieldEffect?: ShieldEffect;
}

export interface BattleAction {
  attackerId: string;
  defenderId: string;
  damage: number;
  type: BattleActionType;
  timestamp: number;
  message?: string;
}

export interface BattleState {
  team1: BattleCharacter[];
  team2: BattleCharacter[];
  activeTeam1Index: number;
  activeTeam2Index: number;
  actions: BattleAction[];
  winner: string | null;
  isComplete: boolean;
}
