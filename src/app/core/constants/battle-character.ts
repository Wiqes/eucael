import { BattleCharacter } from '../../features/battle/battle.model';

export const BATTLE_CHARACTERS: Record<string, Omit<BattleCharacter, 'isAlive' | 'position'>> = {
  RAT: {
    id: 'char1',
    name: 'Red Rat',
    health: 220,
    maxHealth: 220,
    defense: 28,
    attack: 88,
    color: '#ff6b6b',
  },
  CAT: {
    id: 'char2',
    name: 'Blue Cat',
    health: 122,
    maxHealth: 122,
    defense: 23,
    attack: 26,
    color: '#0000ff',
  },
};
