import { IChatMessage, TCreateChatMessage } from "../model/chat.interface";

export interface IChatRepository {
    findMsgById(messageId: string): Promise<IChatMessage | null>
    createMessage(data: TCreateChatMessage): Promise<IChatMessage>;
    getMessagesBetweenUsers(fromId: string, toId: string): Promise<IChatMessage[]>;
    markConversationAsRead(senderId: string, receiverId: string): Promise<void>
    getUsersWhoChattedWithVendor(vendorId: string, search?: string): Promise<{ id: string; firstName: string; role: string; lastMessage?: string; lastMessageTime?: Date; }[]>
    getVendorsWhoChattedWithAdmin(adminId: string, search?: string): Promise<{ id: string, firstName: string, role: string }[]>
    getVendorsWhoChattedWithUser(userId: string, search?: string): Promise<{ id: string; firstName: string; role: string; lastMessage?: string; lastMessageTime?: Date }[]>
    getUnreadMessages(userId: string): Promise<{ id: string; count: number }[]>
}