import { Types } from "mongoose"
import { TCreateHotelDTO, TResponseHotelDTO, TUpdateHotelDTO } from "../../../interfaceAdapters/dtos/hotel.dto"

export interface IHotel {
    _id?: string
    vendorId: string | Types.ObjectId
    name: string
    description: string
    images: string[]
    rating: number
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

//hotel types
export type TCreateHotelData = Omit<IHotel, '_id' | 'createdAt' | 'updatedAt' | 'isBlocked' | 'rating'>;
export type TUpdateHotelData = Partial<Omit<IHotel, '_id' | 'vendorId' | 'createdAt' | 'updatedAt'>>;
export type TResponseHotelData = Omit<IHotel, ''>;

//hotel use cases
export interface ICreateHotelUseCase {
    createHotel(vendorId: string, hotelData: TCreateHotelDTO, files: Express.Multer.File[]): Promise<{ hotel: TResponseHotelDTO; message: string }>;
}

export interface IUpdateHotelUseCase {
    updateHotel(hotelId: string, updateData: TUpdateHotelDTO, files?: Express.Multer.File[]): Promise<{ hotel: TResponseHotelDTO; message: string }>;
}

export interface IGetHotelByIdUseCase {
    getHotel(hotelId: string): Promise<{ hotel: TResponseHotelDTO, message: string }>
}

export interface IGetVendorHotelsUseCase {
    getVendorHotels(vendorId: string, page: number, limit: number, search?: string): Promise<{ hotels: TResponseHotelDTO[], total: number, message: string }>
    getVendorHotel(vendorId: string, hotelId: string): Promise<{ hotel: TResponseHotelDTO, message: string }>
}

export interface IGetAllHotelsUseCase {
    getAllHotel(
        page: number,
        limit: number,
        filters: {
            search?: string;
            amenities?: string[];
            roomType?: string[];
            checkIn?: string;
            checkOut?: string;
            guests?: number;
            minPrice?: number;
            maxPrice?: number;
            sort?: string;
        }
    ): Promise<{ hotels: TResponseHotelData[]; total: number; message: string }>
}
