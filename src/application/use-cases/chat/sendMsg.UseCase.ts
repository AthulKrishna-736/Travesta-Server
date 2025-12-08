import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IChatRepository } from "../../../domain/interfaces/repositories/chatRepo.interface";
import { ISendMessageUseCase, TCreateChatMessage, TResponseChatMessage } from "../../../domain/interfaces/model/chat.interface";

@injectable()
export class SendMessageUseCase implements ISendMessageUseCase {
    constructor(
        @inject(TOKENS.ChatRepository) private _chatRepository: IChatRepository
    ) { }

    async sendMessage(data: TCreateChatMessage): Promise<TResponseChatMessage> {
        const fullMessage = {
            ...data,
            timestamp: new Date(),
            isRead: false
        };

        const newMsg = await this._chatRepository.createMessage(fullMessage);
        return newMsg;
    }
}
