import { TBookingPopulated, TPaymentStatus, TStatus } from "../../domain/interfaces/model/booking.interface"

export type TCreateBookingDTO = {
    userId: string
    hotelId: string
    roomId: string
    checkIn: Date
    checkOut: Date
    guests: number
    totalPrice: number
    roomsCount: number
    couponId?: string
}

export type TResponseBookingDTO = {
    id: string;
    userId: string | object;
    hotelId: string;
    roomId: string;
    hotel?: TBookingPopulated['hotel'];
    room?: TBookingPopulated['room'];
    checkIn: string;
    checkOut: string;
    guests: number;
    totalPrice: number;
    roomsCount: number;
    couponId?: string;
    status: TStatus;
    payment: TPaymentStatus;
    createdAt: Date;
    updatedAt: Date;
}











