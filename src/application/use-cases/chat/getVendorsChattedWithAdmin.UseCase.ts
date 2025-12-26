import { inject, injectable } from "tsyringe";
import { IChatRepository } from "../../../domain/interfaces/repositories/chatRepo.interface";
import { TOKENS } from "../../../constants/token";
import { IGetVendorsChatWithAdminUseCase } from "../../../domain/interfaces/model/chat.interface";
import { CHAT_RES_MESSAGES } from "../../../constants/resMessages";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";

@injectable()
export class GetVendorsChatWithAdmiinUseCase implements IGetVendorsChatWithAdminUseCase {
    constructor(
        @inject(TOKENS.ChatRepository) private _chatRepository: IChatRepository,
    ) { }

    async getVendorsChatWithAdmin(adminId: string, search?: string): Promise<{ vendors: { id: string; firstName: string, role: string }[]; message: string }> {
        const vendors = await this._chatRepository.getVendorsWhoChattedWithAdmin(adminId, search);

        if (!vendors || vendors.length === 0) throw new AppError('No Vendors Found', HttpStatusCode.NOT_FOUND);

        return {
            vendors,
            message: CHAT_RES_MESSAGES.getVendor,
        };
    }
}
