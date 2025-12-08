import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { AppError } from "../../../../utils/appError";
import { HOTEL_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { IGetHotelAnalyticsUseCase } from "../../../../domain/interfaces/model/hotel.interface";
import { HOTEL_RES_MESSAGES } from "../../../../constants/resMessages";
import { BookingRepository } from "../../../../infrastructure/database/repositories/bookingRepo";
import { RoomRepository } from "../../../../infrastructure/database/repositories/roomRepo";
import { IHotelRepository } from "../../../../domain/interfaces/repositories/hotelRepo.interface";

@injectable()
export class GetHotelAnalyticsUseCase implements IGetHotelAnalyticsUseCase {
    constructor(
        @inject(TOKENS.HotelRepository) private _hotelRepository: IHotelRepository,
        @inject(TOKENS.BookingRepository) private _bookingRepository: BookingRepository,
        @inject(TOKENS.RoomRepository) private _roomRepository: RoomRepository,
    ) { }

    async getHotelAnalytics(hotelId: string, period: 'week' | 'month' | 'year'): Promise<{ hotel: any, message: string; }> {
        const hotel = await this._hotelRepository.findHotelById(hotelId);
        if (!hotel) {
            throw new AppError(HOTEL_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const [
            revenue,
            bookings,
            bookingStatus,
            paymentStatus,
            revenueTrend,
            roomPerformance,
        ] = await Promise.all([
            this._bookingRepository.getTotalRevenue(hotelId, period),
            this._bookingRepository.getTotalBookings(hotelId, period),
            this._bookingRepository.getBookingStatusBreakdown(hotelId, period),
            this._bookingRepository.getPaymentStatusBreakdown(hotelId, period),
            this._bookingRepository.getRevenueTrend(hotelId, period),
            this._roomRepository.getRoomPerformance(hotelId, period),
        ]);

        return {
            message: HOTEL_RES_MESSAGES.getHotels,
            hotel: {
                hotelName: hotel.name,
                location: `${hotel.city}, ${hotel.state}`,
                period,
                metrics: {
                    revenue,
                    bookings,
                    occupancy: 0,
                    averageRate: revenue && bookings ? (revenue / bookings) : 0
                },
                charts: {
                    revenueTrend,
                    bookingStatus,
                    paymentStatus,
                },
                roomPerformance
            }
        };
    }
}
