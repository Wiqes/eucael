import { ICreature } from './entities/card.model';

export interface ISummonerResponse {
  creature: ICreature;
  odds: number;
}
