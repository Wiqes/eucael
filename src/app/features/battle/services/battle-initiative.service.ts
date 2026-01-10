import { Injectable } from '@angular/core';
import { BattleCharacter } from '../battle.model';

@Injectable({
  providedIn: 'root',
})
export class BattleInitiativeService {
  calculateInitiative(character: BattleCharacter): number {
    // Initiative = SPD + random(0–10)
    return character.speed + Math.floor(Math.random() * 11);
  }
}
