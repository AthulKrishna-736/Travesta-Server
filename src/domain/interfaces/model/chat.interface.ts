import { TRole } from "../../../shared/types/client.types";

export interface IChatMessage {
  fromId: string;
  fromRole: TRole;
  toId: string;
  toRole: TRole;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export type TCreateChatMessage = Omit<IChatMessage, 'timestamp' | 'isRead'>;

export type TUpdateChatMessage = Partial<Pick<IChatMessage, 'isRead'>>;
