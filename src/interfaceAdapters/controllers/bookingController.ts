import { injectable, inject } from 'tsyringe';
import { Response } from 'express';
import { TOKENS } from '../../constants/token';
import { CustomRequest } from '../../utils/customRequest';
import { ResponseHandler } from '../../middlewares/responseHandler';
import { HttpStatusCode } from '../../constants/HttpStatusCodes';
import { ICreateBookingUseCase, IGetBookingsByHotelUseCase, IGetBookingsByUserUseCase, ICancelBookingUseCase, IGetBookingsToVendorUseCase } from '../../domain/interfaces/model/booking.interface';
import { AppError } from '../../utils/appError';
import { Pagination } from '../../shared/types/common.types';
import { BOOKING_RES_MESSAGES } from '../../constants/resMessages';

@injectable()
export class BookingController {
    constructor(
        @inject(TOKENS.CreateBookingUseCase) private _createBookingUseCase: ICreateBookingUseCase,
        @inject(TOKENS.GetBookingsByHotelUseCase) private _getByHotelUseCase: IGetBookingsByHotelUseCase,
        @inject(TOKENS.GetBookingsByUserUseCase) private _getByUserUseCase: IGetBookingsByUserUseCase,
        @inject(TOKENS.CancelRoomUseCase) private _cancelBookingUseCase: ICancelBookingUseCase,
        @inject(TOKENS.GetBookingsToVendorUseCase) private _getBookingsToVendorUseCase: IGetBookingsToVendorUseCase,
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

            const { booking, message } = await this._createBookingUseCase.createBooking(data);
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

            const { bookings, total } = await this._getByHotelUseCase.getBookingsByHotel(hotelId, page, limit);
            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit), };
            ResponseHandler.success(res, BOOKING_RES_MESSAGES.bookingByHotel, bookings, HttpStatusCode.OK, meta);
        } catch (error) {
            throw error;
        }
    }

    async getBookingsByUser(req: CustomRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const page = Number(req.query.page);
            const limit = Number(req.query.limit);

            const { bookings, total } = await this._getByUserUseCase.getBookingByUser(userId as string, page, limit);
            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit) };
            ResponseHandler.success(res, BOOKING_RES_MESSAGES.bookingByUser, bookings, HttpStatusCode.OK, meta);
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
            const { message } = await this._cancelBookingUseCase.cancelBooking(bookingId, userId as string);
            ResponseHandler.success(res, message, null, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async getBookingsToVendor(req: CustomRequest, res: Response): Promise<void> {
        try {
            const vendorId = req.user?.userId;
            const page = Number(req.query.page);
            const limit = Number(req.query.limit);

            if (!vendorId) {
                throw new AppError('Vendor id is missing', HttpStatusCode.BAD_REQUEST);
            }

            const { bookings, total } = await this._getBookingsToVendorUseCase.getBookingsToVendor(vendorId, page, limit)
            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit) }
            ResponseHandler.success(res, BOOKING_RES_MESSAGES.bookingByUsers, bookings, HttpStatusCode.OK, meta);
        } catch (error) {
            throw error;
        }
    }
}
