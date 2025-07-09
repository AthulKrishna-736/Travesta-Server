import { TRole } from "../../../shared/types/client.types";

//chat model
export interface IChatMessage {
  fromId: string;
  fromRole: TRole;
  toId: string;
  toRole: TRole;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

//chat types
export type TCreateChatMessage = Omit<IChatMessage, 'timestamp' | 'isRead'>;
export type TUpdateChatMessage = Partial<Pick<IChatMessage, 'isRead'>>;
export type TResponseChatMessage = IChatMessage;

//chat use cases
export interface IGetChatMessagesUseCase {
  execute(currentUserId: string, targetUserId: string): Promise<{ chat: TResponseChatMessage[], message: string }>
}

export interface ISendMessageUseCase {
  execute(data: TCreateChatMessage): Promise<void>;
}

