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
    payment: {
        status: 'pending' | 'success' | 'failed' | 'refunded';
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface IWalletTransaction {
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    relatedBookingId?: Types.ObjectId | string;
    date: Date;
}

export interface IWallet {
    _id?: string;
    userId: Types.ObjectId | string;
    balance: number;
    transactions: IWalletTransaction[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ICreatePaymentUseCase {
    execute(data: IWallet): Promise<IWallet>;
}

export interface IUpdatePaymentStatusUseCase {
    execute(paymentId: string, status: 'pending' | 'success' | 'failed' | 'refunded'): Promise<IWallet>;
}

export interface IGetPaymentByIdUseCase {
    execute(paymentId: string): Promise<IWallet>;
}


//hotel types
export type TCreateHotelData = Omit<IHotel, '_id' | 'createdAt' | 'updatedAt' | 'isBlocked' | 'rating'>;
export type TUpdateHotelData = Partial<Omit<IHotel, '_id' | 'vendorId' | 'createdAt' | 'updatedAt'>>;
export type TResponseHotelData = Omit<IHotel, ''>;

//hotel use cases
export interface ICreateHotelUseCase {
    createHotel(hotelData: TCreateHotelData, files: Express.Multer.File[]): Promise<{ hotel: TResponseHotelData; message: string }>;
}

export interface IUpdateHotelUseCase {
    updateHotel(hotelId: string, updateData: TUpdateHotelData, files?: Express.Multer.File[]): Promise<{ hotel: TResponseHotelData; message: string }>;
}

export interface IGetHotelByIdUseCase {
    getHotel(hotelId: string): Promise<{ hotel: TResponseHotelData, message: string }>
}

export interface IGetAllHotelsUseCase {
    getAllHotel(page: number, limit: number, search?: string): Promise<{ hotels: TResponseHotelData[], total: number, message: string }>
}


export type TCreateBookingData = Omit<IBooking, '_id' | 'createdAt' | 'updatedAt' | 'status'>;
export type TUpdateBookingData = Partial<Omit<IBooking, '_id' | 'userId' | 'hotelId' | 'roomId' | 'createdAt' | 'updatedAt'>>;
export type TResponseBookingData = Omit<IBooking, 'checkIn' | 'checkOut'> & {
    checkIn: string;
    checkOut: string;
};
