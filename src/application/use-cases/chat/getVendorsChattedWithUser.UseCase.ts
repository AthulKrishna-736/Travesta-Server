import { inject, injectable } from "tsyringe";
import { IChatRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { TOKENS } from "../../../constants/token";
import { IGetVendorsChatWithUserUseCase } from "../../../domain/interfaces/model/chat.interface";
import { CHAT_RES_MESSAGES } from "../../../constants/resMessages";

@injectable()
export class GetVendorsChatWithUserUseCase implements IGetVendorsChatWithUserUseCase {
    constructor(
        @inject(TOKENS.ChatRepository) private _chatRepo: IChatRepository,
    ) { }

    async getVendorsChatWithUser(userId: string, search?: string): Promise<{ vendors: { id: string; firstName: string, role: string }[]; message: string }> {
        const vendors = await this._chatRepo.getVendorsWhoChattedWithUser(userId, search);
        return {
            vendors,
            message: CHAT_RES_MESSAGES.getVendor,
        };
    }
}
