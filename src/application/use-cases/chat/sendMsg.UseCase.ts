import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IChatRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { ISendMessageUseCase, TCreateChatMessage } from "../../../domain/interfaces/model/chat.interface";

@injectable()
export class SendMessageUseCase implements ISendMessageUseCase {
    constructor(
        @inject(TOKENS.ChatRepository) private chatRepo: IChatRepository
    ) { }

    async execute(data: TCreateChatMessage): Promise<void> {
        const fullMessage = {
            ...data,
            timestamp: new Date(),
            isRead: false
        };

        await this.chatRepo.createMessage(fullMessage);
    }
}
