import { injectable, inject } from 'tsyringe';
import { Response } from 'express';
import { TOKENS } from '../../constants/token';
import { CustomRequest } from '../../utils/customRequest';
import { ResponseHandler } from '../../middlewares/responseHandler';
import { HttpStatusCode } from '../../utils/HttpStatusCodes';
import {
    ICreateBookingUseCase,
    IGetBookingsByHotelUseCase,
    IGetBookingsByUserUseCase,
    ICheckRoomAvailabilityUseCase,
    ICancelBookingUseCase
} from '../../domain/interfaces/model/usecases.interface';

@injectable()
export class BookingController {
    constructor(
        @inject(TOKENS.CreateBookingUseCase) private _createBooking: ICreateBookingUseCase,
        @inject(TOKENS.GetBookingsByHotelUseCase) private _getByHotel: IGetBookingsByHotelUseCase,
        @inject(TOKENS.GetBookingsByUserUseCase) private _getByUser: IGetBookingsByUserUseCase,
        @inject(TOKENS.CancelRoomUseCase) private _cancelBooking: ICancelBookingUseCase
    ) { }

    async createBooking(req: CustomRequest, res: Response): Promise<void> {
        const data = { ...req.body, userId: req.user?.userId as string };
        const { booking, message } = await this._createBooking.execute(data);
        ResponseHandler.success(res, message, booking, HttpStatusCode.CREATED);
    }

    async getBookingsByHotel(req: CustomRequest, res: Response): Promise<void> {
        const hotelId = req.params.hotelId;
        const bookings = await this._getByHotel.execute(hotelId);
        ResponseHandler.success(res, 'Bookings fetched', bookings, HttpStatusCode.OK);
    }

    async getBookingsByUser(req: CustomRequest, res: Response): Promise<void> {
        const userId = req.user?.userId;
        const bookings = await this._getByUser.execute(userId as string);
        ResponseHandler.success(res, 'Bookings fetched', bookings, HttpStatusCode.OK);
    }

    // async checkRoomAvailability(req: CustomRequest, res: Response): Promise<void> {
    //     const { roomId, checkIn, checkOut } = req.query;
    //     const isAvailable = await this._checkAvailability.execute(
    //         roomId as string,
    //         new Date(checkIn as string),
    //         new Date(checkOut as string)
    //     );
    //     ResponseHandler.success(res, 'Availability status', isAvailable, HttpStatusCode.OK);
    // }

    async cancelBooking(req: CustomRequest, res: Response): Promise<void> {
        const bookingId = req.params.id;
        const userId = req.user?.userId;
        const result = await this._cancelBooking.execute(bookingId, userId as string);
        ResponseHandler.success(res, result.message, null, HttpStatusCode.OK);
    }
}
