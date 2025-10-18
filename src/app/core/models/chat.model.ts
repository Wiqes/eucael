import { IProfile } from './entities/profile.model';
import { IUser } from './entities/user.model';

export interface IChat {
  id: string;
  participant1Id: number;
  participant2Id: number;
  participant1?: IParticipant;
  participant2?: IParticipant;
  messages: IChatMessage[]; // Array of message IDs
  lastMessageAt?: Date;
  unreadCount1?: number; // Unread messages for participant1
  unreadCount2?: number; // Unread messages for participant2
}

export interface IParticipant {
  id: string;
  chatId: string;
  avatarUrl: string;
  profile: IProfile;
  userId?: string; // ID of the user for this participant
  lastMessageAt?: Date;
  lastMessage?: string;
  unreadCount?: number;
  isOnline: boolean;
}

export interface IChatMessage {
  id: string;
  muid: string;
  content: string;
  timestamp: Date;
  sender: IUser;
  receiver: IUser;
  chatId?: string;
  isRead?: boolean;
  deliveredAt?: Date;
  readAt?: Date;
}

export interface IChatMessages {
  messages: IChatMessage[];
  chat: IChat;
}
