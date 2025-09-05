import { IProfile } from './entities/profile.model';
import { IUser } from './entities/user.model';

export interface IChat {
  id: string;
  participant1Id: number;
  participant2Id: number;
  participant1?: IParticipant;
  participant2?: IParticipant;
}

export interface IParticipant {
  id: string;
  chatId: string;
  profile: IProfile;
}

export interface IChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  sender: IUser;
  receiver: IUser;
}

export interface IChatMessages {
  messages: IChatMessage[];
  chat: IChat;
}
