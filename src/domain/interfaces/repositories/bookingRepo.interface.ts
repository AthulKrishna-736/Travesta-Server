import { IBooking } from "../model/booking.interface";

export interface IBookingRepository {
    createBooking(data: Partial<IBooking>): Promise<IBooking | null>;
    findBookingsByUser(userId: string, page: number, limit: number, search?: string, sort?: string): Promise<{ bookings: IBooking[]; total: number }>;
    findBookingsByHotel(hotelId: string, page: number, limit: number): Promise<{ bookings: IBooking[]; total: number }>
    isRoomAvailable(roomId: string, checkIn: Date, checkOut: Date): Promise<boolean>;
    findByid(bookingId: string): Promise<IBooking | null>;
    save(booking: IBooking): Promise<void>;
    hasActiveBooking(userId: string): Promise<boolean>
    confirmBookingPayment(bookingId: string): Promise<void>;
    findBookingsByVendor(vendorId: string, page: number, limit: number): Promise<{ bookings: IBooking[]; total: number }>;
    findCustomRoomDates(roomId: string, limit: number): Promise<any>;
    getBookedRoomsCount(roomId: string, checkIn: string, checkOut: string): Promise<number>
    getTotalRevenue(hotelId: string, period: 'week' | 'month' | 'year'): Promise<any>;
    getTotalBookings(hotelId: string, period: 'week' | 'month' | 'year'): Promise<any>;
    getBookingStatusBreakdown(hotelId: string, period: 'week' | 'month' | 'year'): Promise<any>;
    getPaymentStatusBreakdown(hotelId: string, period: 'week' | 'month' | 'year'): Promise<any>;
    getRevenueTrend(hotelId: string, period: 'week' | 'month' | 'year'): Promise<any>;
}