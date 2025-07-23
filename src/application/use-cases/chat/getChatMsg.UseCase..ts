import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IChatRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { IGetChatMessagesUseCase, TResponseChatMessage } from "../../../domain/interfaces/model/chat.interface";

@injectable()
export class GetChatMessagesUseCase implements IGetChatMessagesUseCase {
    constructor(
        @inject(TOKENS.ChatRepository) private _chatRepo: IChatRepository,
    ) { }

    async getChatMessage(currentUserId: string, targetUserId: string): Promise<{ chat: TResponseChatMessage[], message: string }> {

        const chat = await this._chatRepo.getMessagesBetweenUsers(currentUserId, targetUserId);

        return {
            chat,
            message: 'fetched full chat successfully'
        }
    }
}
