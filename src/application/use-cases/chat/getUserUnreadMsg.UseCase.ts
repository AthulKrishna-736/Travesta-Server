import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IChatRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { IGetUserUnreadMsgUseCase } from "../../../domain/interfaces/model/chat.interface";

@injectable()
export class GetUserUnreadMsgUseCase implements IGetUserUnreadMsgUseCase {
    constructor(
        @inject(TOKENS.ChatRepository) private _chatRepo: IChatRepository,
    ) { }

    async getUnreadMsg(userId: string): Promise<{ message: string, users: { id: string, count: number }[] }> {
        const unreadUsers = await this._chatRepo.getUnreadMessages(userId);
        return {
            message: 'Fetched unread messages',
            users: unreadUsers,
        };
    }
}