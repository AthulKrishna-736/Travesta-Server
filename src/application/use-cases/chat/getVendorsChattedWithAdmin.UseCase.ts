import { inject, injectable } from "tsyringe";
import { IChatRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { TOKENS } from "../../../constants/token";
import { IGetVendorsChatWithAdminUseCase } from "../../../domain/interfaces/model/chat.interface";
import { CHAT_RES_MESSAGES } from "../../../constants/resMessages";

@injectable()
export class GetVendorsChatWithAdmiinUseCase implements IGetVendorsChatWithAdminUseCase {
    constructor(
        @inject(TOKENS.ChatRepository) private _chatRepository: IChatRepository,
    ) { }

    async getVendorsChatWithAdmin(adminId: string, search?: string): Promise<{ vendors: { id: string; firstName: string, role: string }[]; message: string }> {
        const vendors = await this._chatRepository.getVendorsWhoChattedWithAdmin(adminId, search);
        return {
            vendors,
            message: CHAT_RES_MESSAGES.getVendor,
        };
    }
}
