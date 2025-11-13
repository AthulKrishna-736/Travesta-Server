import { injectable, inject } from 'tsyringe';
import { NextFunction, Response } from 'express';
import { TOKENS } from '../../constants/token';
import { CustomRequest } from '../../utils/customRequest';
import { ResponseHandler } from '../../middlewares/responseHandler';
import { HttpStatusCode } from '../../constants/HttpStatusCodes';
import { IGetBookingsByHotelUseCase, IGetBookingsByUserUseCase, ICancelBookingUseCase, IGetBookingsToVendorUseCase, IGetVendorHotelAnalyticsUseCase } from '../../domain/interfaces/model/booking.interface';
import { AppError } from '../../utils/appError';
import { Pagination } from '../../shared/types/common.types';
import { BOOKING_RES_MESSAGES } from '../../constants/resMessages';
import { AUTH_ERROR_MESSAGES, BOOKING_ERROR_MESSAGES, HOTEL_ERROR_MESSAGES } from '../../constants/errorMessages';
import { IBookingController } from '../../domain/interfaces/controllers/bookingController.interface';

@injectable()
export class BookingController implements IBookingController {
    constructor(
        @inject(TOKENS.GetBookingsByHotelUseCase) private _getByHotelUseCase: IGetBookingsByHotelUseCase,
        @inject(TOKENS.GetBookingsByUserUseCase) private _getByUserUseCase: IGetBookingsByUserUseCase,
        @inject(TOKENS.CancelRoomUseCase) private _cancelBookingUseCase: ICancelBookingUseCase,
        @inject(TOKENS.GetBookingsToVendorUseCase) private _getBookingsToVendorUseCase: IGetBookingsToVendorUseCase,
        @inject(TOKENS.GetVendorHotelAnalyticsUseCase) private _getVendorHotelAnalyticsUseCase: IGetVendorHotelAnalyticsUseCase,
    ) { }

    async getBookingsByHotel(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const hotelId = req.params.hotelId;
            if (!hotelId) {
                throw new AppError(HOTEL_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }
            const page = Number(req.query.page);
            const limit = Number(req.query.limit);

            const { bookings, total } = await this._getByHotelUseCase.getBookingsByHotel(hotelId, page, limit);
            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit), };
            ResponseHandler.success(res, BOOKING_RES_MESSAGES.bookingByHotel, bookings, HttpStatusCode.OK, meta);
        } catch (error) {
            next(error);
        }
    }

    async getBookingsByUser(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            const page = Number(req.query.page);
            const limit = Number(req.query.limit);
            const search = req.query.search as string;
            const sort = req.query.sort as string;

            const { bookings, total } = await this._getByUserUseCase.getBookingByUser(userId as string, page, limit, search, sort);
            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit) };
            ResponseHandler.success(res, BOOKING_RES_MESSAGES.bookingByUser, bookings, HttpStatusCode.OK, meta);
        } catch (error) {
            next(error);
        }

    }

    async cancelBooking(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const bookingId = req.params.bookingId;
            const userId = req.user?.userId;

            if (!bookingId) {
                throw new AppError(BOOKING_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }
            const { message } = await this._cancelBookingUseCase.cancelBooking(bookingId, userId as string);
            ResponseHandler.success(res, message, null, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getBookingsToVendor(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const vendorId = req.user?.userId;
            const page = Number(req.query.page);
            const limit = Number(req.query.limit);
            const hotelId = req.query.hotelId as string;
            const startDate = req.query.startDate as string;
            const endDate = req.query.endDate as string;

            if (!vendorId) {
                throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            const { bookings, total } = await this._getBookingsToVendorUseCase.getBookingsToVendor(vendorId, page, limit, hotelId, startDate, endDate);
            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit) }
            ResponseHandler.success(res, BOOKING_RES_MESSAGES.bookingByUsers, bookings, HttpStatusCode.OK, meta);
        } catch (error) {
            next(error);
        }
    }

    async getVendorHotelAnalytics(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const vendorId = req.user?.userId;
            const startDate = req.query.startDate as string;
            const endDate = req.query.endDate as string;
            if (!vendorId) {
                throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            const { message, analytics } = await this._getVendorHotelAnalyticsUseCase.getVendorHotelAnalytics(vendorId, startDate, endDate)
            ResponseHandler.success(res, message, analytics, HttpStatusCode.OK);
        } catch (error) {
            next(error)
        }
    }
}
