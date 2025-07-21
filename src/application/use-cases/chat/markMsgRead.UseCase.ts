import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IChatRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { IMarkMsgAsReadUseCase } from "../../../domain/interfaces/model/chat.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";


@injectable()
export class MarkMsgAsReadUseCase implements IMarkMsgAsReadUseCase {
    constructor(
        @inject(TOKENS.ChatRepository) private _chatRepo: IChatRepository,
    ) { }

    async markMsgAsRead(messageId: string): Promise<void> {
        const message = await this._chatRepo.findMsgById(messageId);

        if (!message) {
            throw new AppError('Invalid Id message does not exist!', HttpStatusCode.CONFLICT);
        }

        try {
            await this._chatRepo.markMessageAsRead(messageId);
        } catch (error) {
            throw new AppError(`Error while marking msg read ${error}`, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
    }
}