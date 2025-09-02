import { Types } from "mongoose";

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
    createBooking(data: TCreateBookingData): Promise<{ booking: TResponseBookingData; message: string }>;
}

export interface ICancelBookingUseCase {
    cancelBooking(bookingId: string, userId: string): Promise<{ message: string }>;
}

export interface IGetBookingsByUserUseCase {
    getBookingByUser(userId: string, page: number, limit: number): Promise<{ bookings: TResponseBookingData[], total: number }>
}

export interface IGetBookingsByHotelUseCase {
    getBookingsByHotel(hotelId: string, page: number, limit: number): Promise<{ bookings: TResponseBookingData[], total: number }>
}

export interface ICheckRoomAvailabilityUseCase {
    execute(roomId: string, checkIn: Date, checkOut: Date): Promise<boolean>;
}

export interface IGetBookingsToVendorUseCase {
    getBookingsToVendor(vendorId: string, page: number, limit: number): Promise<{ bookings: TResponseBookingData[], total: number }>
}