export interface BattleCharacter {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  defense: number;
  attack: number;
  position: { x: number; y: number; z: number };
  color: string;
  isAlive: boolean;
}

export interface BattleAction {
  attackerId: string;
  defenderId: string;
  damage: number;
  type: 'attack' | 'critical' | 'blocked';
  timestamp: number;
}

export interface BattleState {
  character1: BattleCharacter;
  character2: BattleCharacter;
  actions: BattleAction[];
  winner: string | null;
  isComplete: boolean;
}
