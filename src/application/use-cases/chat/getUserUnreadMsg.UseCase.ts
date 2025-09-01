import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IChatRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { IGetUserUnreadMsgUseCase } from "../../../domain/interfaces/model/chat.interface";
import { CHAT_RES_MESSAGES } from "../../../constants/resMessages";

@injectable()
export class GetUserUnreadMsgUseCase implements IGetUserUnreadMsgUseCase {
    constructor(
        @inject(TOKENS.ChatRepository) private _chatRepo: IChatRepository,
    ) { }

    async getUnreadMsg(userId: string): Promise<{ message: string, users: { id: string, count: number }[] }> {
        const unreadUsers = await this._chatRepo.getUnreadMessages(userId);
        return {
            message: CHAT_RES_MESSAGES.unread,
            users: unreadUsers,
        };
    }
}