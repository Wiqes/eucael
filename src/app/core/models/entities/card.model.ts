export interface ICard {
  id: number;
  animalId: number;
  colorId: number;
  color: IColor;
}

export interface ITotem extends ICard {
  level: number;
}

export interface ICreature extends ICard {
  level: number;
  name: string;
  imageUrl: string;
}

interface IColor {
  id: number;
  name: string;
  hex: string;
}
