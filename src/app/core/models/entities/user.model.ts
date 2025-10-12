import { IChat } from '../chat.model';
import { IProfile } from './profile.model';

export interface IUser {
  id: string;
  username: string;
  photoURL?: string;
  locale: string;
  profile: IProfile;
  createdAt: string;
  chatsAsParticipant1: IChat[];
  chatsAsParticipant2: IChat[];
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface IFoundUser {
  id: string;
  name: string;
}
