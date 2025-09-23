import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IChatRepository } from "../../../domain/interfaces/repositories/chatRepo.interface";
import { IGetChatMessagesUseCase, TResponseChatMessage } from "../../../domain/interfaces/model/chat.interface";
import { CHAT_RES_MESSAGES } from "../../../constants/resMessages";

@injectable()
export class GetChatMessagesUseCase implements IGetChatMessagesUseCase {
    constructor(
        @inject(TOKENS.ChatRepository) private _chatRepository: IChatRepository,
    ) { }

    async getChatMessage(currentUserId: string, targetUserId: string): Promise<{ chat: TResponseChatMessage[], message: string }> {

        const chat = await this._chatRepository.getMessagesBetweenUsers(currentUserId, targetUserId);

        return {
            chat,
            message: CHAT_RES_MESSAGES.getChat,
        }
    }
}
