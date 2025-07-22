export interface ICard {
  id: number;
  animalId: number;
  imageUrl: string;
}

export interface ITotem extends ICard {
  level: number;
}

export interface ICreature extends ICard {
  level: number;
}
