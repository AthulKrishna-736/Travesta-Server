import { inject, injectable } from "tsyringe";
import { IChatRepository } from "../../../domain/interfaces/repositories/chatRepo.interface";
import { IGetChattedUsersUseCase } from "../../../domain/interfaces/model/chat.interface";
import { TOKENS } from "../../../constants/token";
import { CHAT_RES_MESSAGES } from "../../../constants/resMessages";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";

@injectable()
export class GetChattedUsersUseCase implements IGetChattedUsersUseCase {
    constructor(
        @inject(TOKENS.ChatRepository) private _chatRepository: IChatRepository,
    ) { }

    async getChattedUsers(vendorId: string, search?: string): Promise<{ users: { id: string; firstName: string, role: string }[]; message: string }> {
        const users = await this._chatRepository.getUsersWhoChattedWithVendor(vendorId, search);
        if (!users) {
            throw new AppError('No users had conversation with vendor', HttpStatusCode.NOT_FOUND);
        }
        
        return {
            users,
            message: CHAT_RES_MESSAGES.getUsers,
        };
    }
}
