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
  getChatMessage(currentUserId: string, targetUserId: string): Promise<{ chat: TResponseChatMessage[], message: string }>
}

export interface ISendMessageUseCase {
  sendMessage(data: TCreateChatMessage): Promise<TResponseChatMessage | null>;
}

export interface IGetChattedUsersUseCase {
  getChattedUsers(vendorId: string, search?: string): Promise<{ users: { id: string; firstName: string, role: string }[]; message: string; }>;
}

export interface IGetVendorsChatWithUserUseCase {
  getVendorsChatWithUser(userId: string, search?: string): Promise<{ vendors: { id: string; firstName: string, role: string }[]; message: string; }>;
}

export interface IGetVendorsChatWithAdminUseCase {
  getVendorsChatWithAdmin(adminId: string, search?: string): Promise<{ vendors: { id: string; firstName: string, role: string }[]; message: string; }>;
}

export interface IMarkMsgAsReadUseCase {
  markMsgAsRead(senderId: string, receiverId: string): Promise<{ message: string }>;
}

export interface IGetUserUnreadMsgUseCase {
  getUnreadMsg(userId: string): Promise<{ message: string, users: { id: string, count: number }[] }>
}

export interface IGetChatAccessUseCase {
  getChatAccess(userId: string): Promise<{ message: string }>;
}
