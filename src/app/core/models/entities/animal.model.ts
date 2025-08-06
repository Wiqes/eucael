import { ICreature, ITotem } from './card.model';

export interface IAnimal {
  id: number;
  name: string;
  male: ICreature[];
  female: ICreature[];
  totem: ITotem[];
}
