import { inject, injectable } from "tsyringe";
import { IChatRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { IGetChattedUsersUseCase } from "../../../domain/interfaces/model/chat.interface";
import { TOKENS } from "../../../constants/token";

@injectable()
export class GetChattedUsersUseCase implements IGetChattedUsersUseCase {
    constructor(
        @inject(TOKENS.ChatRepository) private chatRepo: IChatRepository,
    ) {}

    async execute(vendorId: string): Promise<{ users: { id: string; firstName: string }[]; message: string }> {
        const users = await this.chatRepo.getUsersWhoChattedWithVendor(vendorId);
        return {
            users,
            message: "Fetched users who chatted with vendor"
        };
    }
}
