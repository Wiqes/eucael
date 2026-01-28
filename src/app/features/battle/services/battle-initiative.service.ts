import { Injectable } from '@angular/core';
import { BattleCharacter } from '../battle.model';

@Injectable({
  providedIn: 'root',
})
export class BattleInitiativeService {
  private readonly initiativeRandomMax = 10;

  calculateInitiative(character: BattleCharacter): number {
    // Initiative = SPD + random(0–10)
    return character.speed + Math.floor(Math.random() * (this.initiativeRandomMax + 1));
  }
}
