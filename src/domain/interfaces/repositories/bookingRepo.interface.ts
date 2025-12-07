import { ClientSession } from "mongoose";
import { IBooking, TBookingPopulated, TCreateBookingData } from "../model/booking.interface";
import { IHotel } from "../model/hotel.interface";
import { IRoom } from "../model/room.interface";

export interface IBookingRepository {
    createBooking(data: Partial<IBooking>, session?: ClientSession): Promise<IBooking>;
    createBookingIfAvailable(roomId: string, bookingData: TCreateBookingData, session: ClientSession): Promise<IBooking | null>;
    findBookingsByUser(
        userId: string,
        page: number,
        limit: number,
        search?: string,
        sort?: string
    ): Promise<{ bookings: TBookingPopulated[]; total: number }>;
    findBookingsByHotel(hotelId: string, page: number, limit: number): Promise<{ bookings: IBooking[]; total: number }>
    isRoomAvailable(roomId: string, rooms: number, checkIn: Date, checkOut: Date, session?: ClientSession): Promise<boolean>;
    findByid(bookingId: string): Promise<IBooking | null>;
    save(booking: IBooking): Promise<void>;
    hasActiveBooking(userId: string): Promise<boolean>
    confirmBookingPayment(bookingId: string): Promise<void>;
    findBookingsByVendor(vendorId: string, page: number, limit: number, hotelId?: string, startDate?: string, endDate?: string): Promise<{ bookings: IBooking[]; total: number }>;
    getBookedRoomsCount(roomId: string, checkIn: Date, checkOut: Date): Promise<number>
    getTotalRevenue(hotelId: string, period: 'week' | 'month' | 'year'): Promise<any>;
    getTotalBookings(hotelId: string, period: 'week' | 'month' | 'year'): Promise<any>;
    getBookingStatusBreakdown(hotelId: string, period: 'week' | 'month' | 'year'): Promise<any>;
    getPaymentStatusBreakdown(hotelId: string, period: 'week' | 'month' | 'year'): Promise<any>;
    getRevenueTrend(hotelId: string, period: 'week' | 'month' | 'year'): Promise<any>;
    getVendorAnalyticsSummary(vendorId: string, startDate?: string, endDate?: string): Promise<{ totalRevenue: number; totalBookings: number; averageBookingValue: number; activeHotels: number; }>
    getVendorTopHotels(vendorId: string, limit?: number, startDate?: string, endDate?: string): Promise<Array<{ hotelId: string; hotelName: string; revenue: number; bookings: number; }>>;
    getVendorMonthlyRevenue(vendorId: string, startDate?: string, endDate?: string): Promise<Array<{ month: string; revenue: number; bookings: number; }>>;
    getVendorBookingStatus(vendorId: string, startDate?: string, endDate?: string): Promise<Array<{ status: string; count: number; }>>;
}