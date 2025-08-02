import { injectable, inject } from 'tsyringe';
import { Response } from 'express';
import { TOKENS } from '../../constants/token';
import { CustomRequest } from '../../utils/customRequest';
import { ResponseHandler } from '../../middlewares/responseHandler';
import { HttpStatusCode } from '../../utils/HttpStatusCodes';
import { ICreateBookingUseCase, IGetBookingsByHotelUseCase, IGetBookingsByUserUseCase, ICancelBookingUseCase } from '../../domain/interfaces/model/booking.interface';
import { AppError } from '../../utils/appError';
import { Pagination } from '../../shared/types/common.types';

@injectable()
export class BookingController {
    constructor(
        @inject(TOKENS.CreateBookingUseCase) private _createBooking: ICreateBookingUseCase,
        @inject(TOKENS.GetBookingsByHotelUseCase) private _getByHotel: IGetBookingsByHotelUseCase,
        @inject(TOKENS.GetBookingsByUserUseCase) private _getByUser: IGetBookingsByUserUseCase,
        @inject(TOKENS.CancelRoomUseCase) private _cancelBooking: ICancelBookingUseCase
    ) { }

    async createBooking(req: CustomRequest, res: Response): Promise<void> {
        try {
            const data = {
                ...req.body,
                userId: req.user?.userId as string,
            };

            if (!data.userId || !data.hotelId || !data.roomId || !data.checkIn || !data.checkOut || !data.totalPrice) {
                throw new AppError('Missing booking fields', HttpStatusCode.BAD_REQUEST);
            }
            const checkInDate = new Date(data.checkIn);
            const checkOutDate = new Date(data.checkOut);

            if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                throw new AppError("Invalid check-in or check-out date format", HttpStatusCode.BAD_REQUEST);
            }

            if (checkOutDate <= checkInDate) {
                throw new AppError("Check-out date must be after check-in date", HttpStatusCode.BAD_REQUEST);
            }

            const { booking, message } = await this._createBooking.execute(data);
            ResponseHandler.success(res, message, booking, HttpStatusCode.CREATED);
        } catch (error) {
            throw error;
        }
    }

    async getBookingsByHotel(req: CustomRequest, res: Response): Promise<void> {
        try {
            const hotelId = req.params.hotelId;
            if (!hotelId) {
                throw new AppError('hotelId is missing', HttpStatusCode.BAD_REQUEST);
            }
            const page = Number(req.query.page);
            const limit = Number(req.query.limit);

            const { bookings, total } = await this._getByHotel.getBookingsByHotel(hotelId, page, limit);
            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit), };
            ResponseHandler.success(res, 'Bookings by hotel fetched successfully', bookings, HttpStatusCode.OK, meta);
        } catch (error) {
            throw error;
        }
    }

    async getBookingsByUser(req: CustomRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const page = Number(req.query.page);
            const limit = Number(req.query.limit);

            const { bookings, total } = await this._getByUser.getBookingByUser(userId as string, page, limit);
            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit), };
            ResponseHandler.success(res, 'Bookings by user fetched successfully', bookings, HttpStatusCode.OK, meta);
        } catch (error) {
            throw error;
        }

    }

    async cancelBooking(req: CustomRequest, res: Response): Promise<void> {
        try {
            const bookingId = req.params.bookingId;
            const userId = req.user?.userId;

            if (!bookingId) {
                throw new AppError('Booking id is missing', HttpStatusCode.BAD_REQUEST);
            }
            const { message } = await this._cancelBooking.execute(bookingId, userId as string);
            ResponseHandler.success(res, message, null, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }
}
