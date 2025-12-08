import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IBookingRepository } from "../../../domain/interfaces/repositories/bookingRepo.interface";
import { IRatingRepository } from "../../../domain/interfaces/repositories/ratingRepo.interface";
import { IGetAdminAnalyticsUseCase } from "../../../domain/interfaces/model/booking.interface";

@injectable()
export class GetAdminAnalyticsUseCase implements IGetAdminAnalyticsUseCase {
    constructor(
        @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository,
        @inject(TOKENS.RatingRepository) private _ratingRepository: IRatingRepository,
    ) { }

    async getAnalytics(startDate?: string, endDate?: string): Promise<{ data: any, message: string }> {
        const [
            counts,
            totalRevenue,
            totalBookings,
            bookingsChart,
            topHotels,
            topVendors,
            topRevenueDays,
            averageRating,
        ] = await Promise.all([
            this._bookingRepository.getCounts(),
            this._bookingRepository.getTotalVendorRevenue(startDate, endDate),
            this._bookingRepository.getTotalVendorBookings(startDate, endDate),
            this._bookingRepository.getBookingsChart("month", startDate, endDate),
            this._bookingRepository.getTopHotels(5, startDate, endDate),
            this._bookingRepository.getTopVendors(5, startDate, endDate),
            this._bookingRepository.getTopRevenueDays(5, startDate, endDate),
            this._ratingRepository.getAverageRating(startDate, endDate),
        ]);

        return {
            message: "Admin analytics fetched successfully",
            data: {
                counts,
                totalRevenue,
                totalBookings,
                bookingsChart,
                topHotels,
                topVendors,
                topRevenueDays,
                averageRating,
            },
        };
    }
}
