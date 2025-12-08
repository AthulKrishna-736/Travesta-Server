import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IGetChatAccessUseCase } from "../../../domain/interfaces/model/chat.interface";
import { IBookingRepository } from "../../../domain/interfaces/repositories/bookingRepo.interface";
import { AppError } from "../../../utils/appError";
import { CHAT_ERROR_MESSAGES } from "../../../constants/errorMessages";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { CHAT_RES_MESSAGES } from "../../../constants/resMessages";


@injectable()
export class GetChatAccessUseCase implements IGetChatAccessUseCase {
    constructor(
        @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository,
    ) { }

    async getChatAccess(userId: string): Promise<{ message: string }> {
        const canChat = await this._bookingRepository.hasActiveBooking(userId);
        if (!canChat) {
            throw new AppError(CHAT_ERROR_MESSAGES.access, HttpStatusCode.FORBIDDEN);
        }

        return {
            message: canChat && CHAT_RES_MESSAGES.access,
        }
    }
}