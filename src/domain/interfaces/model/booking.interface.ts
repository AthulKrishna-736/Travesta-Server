import { ClientSession, Types } from "mongoose";

export type TStatus = 'confirmed' | 'cancelled' | 'pending';
export type TPaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

//booking model
export interface IBooking {
    _id?: string;
    userId: string | Types.ObjectId;
    hotelId: string | Types.ObjectId;
    roomId: string | Types.ObjectId;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    totalPrice: number;
    roomsCount?: number;
    couponId?: string | Types.ObjectId;
    status: TStatus;
    payment: TPaymentStatus;
    createdAt: Date;
    updatedAt: Date;
}

//booking types
export type TCreateBookingData = Omit<IBooking, '_id' | 'createdAt' | 'updatedAt' | 'status' | 'payment'>;
export type TUpdateBookingData = Partial<Omit<IBooking, '_id' | 'userId' | 'hotelId' | 'roomId' | 'createdAt' | 'updatedAt'>>;
export type TResponseBookingData = Omit<IBooking, 'checkIn' | 'checkOut'> & { checkIn: string, checkOut: string };


//booking use case
export interface ICreateBookingUseCase {
    createBooking(data: TCreateBookingData, session: ClientSession): Promise<{ booking: TResponseBookingData; message: string }>;
}

export interface ICancelBookingUseCase {
    cancelBooking(bookingId: string, userId: string): Promise<{ message: string }>;
}

export interface IGetBookingsByUserUseCase {
    getBookingByUser(userId: string, page: number, limit: number, search?: string, sort?: string): Promise<{ bookings: TResponseBookingData[], total: number }>
}

export interface IGetBookingsByHotelUseCase {
    getBookingsByHotel(hotelId: string, page: number, limit: number): Promise<{ bookings: TResponseBookingData[], total: number }>
}


export interface IGetBookingsToVendorUseCase {
    getBookingsToVendor(vendorId: string, page: number, limit: number, hotelId?: string, startDate?: string, endDate?: string): Promise<{ bookings: TResponseBookingData[], total: number }>
}

export interface IGetCustomRoomDatesUseCase {
    getCustomRoomDates(roomId: string, limit: number, checkIn: string, checkOut: string): Promise<{ message: string, roomDates: any }>;
}

export interface IGetVendorHotelAnalyticsUseCase {
    getVendorHotelAnalytics(vendorId: string, startDate?: string, endDate?: string): Promise<{
        message: string;
        analytics: {
            summary: any;
            topHotels: Array<{ hotelId: string; hotelName: string; revenue: number; bookings: number }>;
            monthlyRevenue: Array<{ month: string; revenue: number }>;
            bookingStatus: Array<{ name: string; value: number; color: string }>;
        };
    }>
}