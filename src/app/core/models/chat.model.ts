import { IProfile } from './entities/profile.model';

export interface IChat {
  id: string;
  participant1Id: number;
  participant2Id: number;
  participant1?: IParticipant;
  participant2?: IParticipant;
}

export interface IParticipant {
  chatId: string;
  profile: IProfile;
}
