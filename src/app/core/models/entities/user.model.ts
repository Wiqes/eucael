import { IProfile } from './profile.model';

export interface IUser {
  id: string;
  username: string;
  photoURL?: string;
  locale: string;
  profile: IProfile;
  createdAt: string;
}
