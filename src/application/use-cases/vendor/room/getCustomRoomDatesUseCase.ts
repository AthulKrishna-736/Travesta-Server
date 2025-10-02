import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { IRoomRepository } from "../../../../domain/interfaces/repositories/roomRepo.interface";
import { AppError } from "../../../../utils/appError";
import { ROOM_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { ROOM_RES_MESSAGES } from "../../../../constants/resMessages";
import { IBookingRepository } from "../../../../domain/interfaces/repositories/bookingRepo.interface";
import { IGetCustomRoomDatesUseCase } from "../../../../domain/interfaces/model/booking.interface";


@injectable()
export class GetCustomRoomDatesUseCase implements IGetCustomRoomDatesUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) private _roomRepository: IRoomRepository,
        @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository,
    ) { }

    async getCustomRoomDates(roomId: string, limit: number, checkIn: string, checkOut: string): Promise<{ message: string, roomDates: any }> {
        const ROOM_EXIST = await this._roomRepository.findRoomById(roomId);
        if (!ROOM_EXIST) {
            throw new AppError(ROOM_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const ROOM_DATES = await this._bookingRepository.findCustomRoomDates(roomId, limit);

        return {
            message: ROOM_RES_MESSAGES.customRoomDates,
            roomDates: ROOM_DATES,
        }

    }
}