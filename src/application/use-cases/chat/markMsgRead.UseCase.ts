import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IChatRepository, IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { IMarkMsgAsReadUseCase } from "../../../domain/interfaces/model/chat.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";


@injectable()
export class MarkMsgAsReadUseCase implements IMarkMsgAsReadUseCase {
    constructor(
        @inject(TOKENS.ChatRepository) private _chatRepository: IChatRepository,
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
    ) { }

    async markMsgAsRead(senderId: string, receiverId: string): Promise<void> {
        const [senderExists, receiverExists] = await Promise.all([
            this._userRepository.findUserExist(senderId),
            this._userRepository.findUserExist(receiverId)
        ]);

        if (!senderExists || !receiverExists) {
            throw new AppError("Sender or Receiver not found", HttpStatusCode.NOT_FOUND);
        }

        await this._chatRepository.markConversationAsRead(senderId, receiverId);
    }

}