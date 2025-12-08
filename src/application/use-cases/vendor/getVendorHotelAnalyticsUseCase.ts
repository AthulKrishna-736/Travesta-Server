import { injectable, inject } from "tsyringe";
import { BookingRepository } from "../../../infrastructure/database/repositories/bookingRepo";
import { TOKENS } from "../../../constants/token";
import { IGetVendorHotelAnalyticsUseCase } from "../../../domain/interfaces/model/booking.interface";

@injectable()
export class GetVendorHotelAnalyticsUseCase implements IGetVendorHotelAnalyticsUseCase {
    constructor(
        @inject(TOKENS.BookingRepository) private _bookingRepository: BookingRepository,
    ) { }

    async getVendorHotelAnalytics(vendorId: string, startDate?: string, endDate?: string): Promise<{
        message: string;
        analytics: {
            summary: any;
            topHotels: Array<{ hotelId: string; hotelName: string; revenue: number; bookings: number }>;
            monthlyRevenue: Array<{ month: string; revenue: number }>;
            bookingStatus: Array<{ name: string; value: number; color: string }>;
        };
    }> {

        const [summary, topHotels, monthlyRevenue, bookingStatus] = await Promise.all([
            this._bookingRepository.getVendorAnalyticsSummary(vendorId, startDate, endDate),
            this._bookingRepository.getVendorTopHotels(vendorId, 5, startDate, endDate),
            this._bookingRepository.getVendorMonthlyRevenue(vendorId, startDate, endDate),
            this._bookingRepository.getVendorBookingStatus(vendorId, startDate, endDate),
        ]);

        const bookingStatusFormatted = bookingStatus.map((item: any) => ({
            name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
            value: item.count,
            color:
                item.status === "confirmed" ? "#10b981" : item.status === "pending" ? "#f59e0b" : "#ef4444",
        }));

        return {
            message: 'vendor analytics fetched successfully',
            analytics: {
                summary,
                topHotels,
                monthlyRevenue,
                bookingStatus: bookingStatusFormatted,
            },
        };
    }
}
