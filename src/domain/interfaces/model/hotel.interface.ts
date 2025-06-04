import { Types } from "mongoose"

export interface IHotel {
    _id?: string
    vendorId: string | Types.ObjectId
    name: string
    description: string
    images: string[]
    rating: number
    services: string[]
    amenities: string[]
    tags: string[]
    state: string
    city: string
    address: string
    geoLocation: [number, number]
    isBlocked: boolean
    createdAt: Date
    updatedAt: Date
}

export interface IRoom {
    _id?: string
    hotelId: string | Types.ObjectId
    name: string
    capacity: number
    bedType: string
    amenities: string[]
    images: string[]
    basePrice: number
    isAvailable: boolean
    createdAt: Date
    updatedAt: Date
}

export interface IBooking {
    _id?: string;
    userId: string | Types.ObjectId;
    hotelId: string | Types.ObjectId;
    roomId: string | Types.ObjectId;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    totalPrice: number;
    status: 'confirmed' | 'cancelled' | 'pending';
    createdAt: Date;
    updatedAt: Date;
}


export type TCreateHotelData = Omit<IHotel, '_id' | 'createdAt' | 'updatedAt' | 'isBlocked' | 'rating'>;

export type TUpdateHotelData = Partial<Omit<IHotel, '_id' | 'vendorId' | 'createdAt' | 'updatedAt'>>;

export type TResponseHotelData = Omit<IHotel, ''>;

export type TCreateRoomData = Omit<IRoom, '_id' | 'isAvailable' | 'createdAt' | 'updatedAt'>;

export type TUpdateRoomData = Partial<Omit<IRoom, '_id' | 'createdAt' | 'updatedAt'>>;

export type TResponseRoomData = Omit<IRoom, ''>;

export type TCreateBookingData = Omit<IBooking, '_id' | 'createdAt' | 'updatedAt' | 'status'>;

export type TUpdateBookingData = Partial<Omit<IBooking, '_id' | 'userId' | 'hotelId' | 'roomId' | 'createdAt' | 'updatedAt'>>;

export type TResponseBookingData = IBooking;
