import { inject, injectable } from "tsyringe";
import { IChatRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { IGetChattedUsersUseCase } from "../../../domain/interfaces/model/chat.interface";
import { TOKENS } from "../../../constants/token";

@injectable()
export class GetChattedUsersUseCase implements IGetChattedUsersUseCase {
    constructor(
        @inject(TOKENS.ChatRepository) private _chatRepo: IChatRepository,
    ) {}

    async getChattedUsers(vendorId: string, search?: string): Promise<{ users: { id: string; firstName: string, role: string }[]; message: string }> {
        const users = await this._chatRepo.getUsersWhoChattedWithVendor(vendorId, search);
        return {
            users,
            message: "Fetched users who chatted with vendor"
        };
    }
}
