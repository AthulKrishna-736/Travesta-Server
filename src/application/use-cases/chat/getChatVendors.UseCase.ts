import { inject, injectable } from "tsyringe";
import { IChatRepository } from "../../../domain/interfaces/repositories/chatRepo.interface";
import { TOKENS } from "../../../constants/token";
import { IGetChatVendorsUseCase, TResponseChatMessage } from "../../../domain/interfaces/model/chat.interface";
import { CHAT_RES_MESSAGES } from "../../../constants/resMessages";

@injectable()
export class GetChatVendorsUseCase implements IGetChatVendorsUseCase {
    constructor(
        @inject(TOKENS.ChatRepository) private _chatRepository: IChatRepository,
    ) { }

    async getChatVendors(search?: string): Promise<{ vendors: TResponseChatMessage[], message: string }> {
        const vendors = await this._chatRepository.getChatVendors(search);

        if (!vendors || vendors.length === 0) {
            return { vendors: [], message: CHAT_RES_MESSAGES.notFound }
        }

        return {
            vendors,
            message: CHAT_RES_MESSAGES.getVendor,
        };
    }
}
