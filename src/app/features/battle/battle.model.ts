export interface PoisonEffect {
  turnsRemaining: number;
  damagePerTurn: number;
}

export interface DebuffEffect {
  attackReduction: number;
  accuracyReduction: number;
}

export interface BattleCharacter {
  id: string;
  name: string;
  race: 'rat' | 'cat' | 'bear' | 'horse' | 'giraffe';
  health: number;
  maxHealth: number;
  defense: number;
  attack: number;
  speed: number;
  focus: number;
  position: { x: number; y: number; z: number };
  color: string;
  isAlive: boolean;
  turnCount: number;
  poisonEffect?: PoisonEffect;
  debuffEffect?: DebuffEffect;
}

export interface BattleAction {
  attackerId: string;
  defenderId: string;
  damage: number;
  type: 'attack' | 'critical' | 'blocked' | 'miss' | 'poison' | 'combo';
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
