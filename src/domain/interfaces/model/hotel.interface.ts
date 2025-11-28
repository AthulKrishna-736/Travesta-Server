import { Types } from "mongoose"
import { TCreateHotelDTO, TResponseHotelDTO, TUpdateHotelDTO } from "../../../interfaceAdapters/dtos/hotel.dto"
import { TResponseRoomDTO } from "../../../interfaceAdapters/dtos/room.dto";

export type TIdProof = 'Aadhaar' | 'Passport' | 'DrivingLicense' | 'PAN';

//hotel model
export interface IHotel {
    _id?: string
    vendorId: string | Types.ObjectId
    name: string
    description: string
    images: string[]
    amenities: string[]
    tags: string[]
    state: string
    city: string
    address: string
    isBlocked: boolean
    geoLocation: {
        type: string,
        coordinates: [number, number],
    }
    propertyRules: {
        checkInTime: string,
        checkOutTime: string,
        minGuestAge: number,
        petsAllowed: boolean,
        breakfastFee?: number,
        outsideFoodAllowed: boolean,
        idProofAccepted: TIdProof[],
        specialNotes?: string,
    }
    createdAt: Date
    updatedAt: Date
}

//hotel types
export type TCreateHotelData = Omit<IHotel, '_id' | 'createdAt' | 'updatedAt' | 'isBlocked'>;
export type TUpdateHotelData = Partial<Omit<IHotel, '_id' | 'vendorId' | 'createdAt' | 'updatedAt' | 'isBlocked' | 'geoLocation' | 'propertyRules'>> & {
    geoLocation?: Partial<IHotel['geoLocation']>;
    propertyRules?: Partial<IHotel['propertyRules']>;
};


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
        checkIn: string,
        checkOut: string,
        rooms: number,
        adults: number,
        children: number,
        geoLocation: { long: number, lat: number },
        search?: string,
        amenities?: string[],
        roomType?: string[],
        minPrice?: number,
        maxPrice?: number,
        sort?: string,
    ): Promise<{ hotels: (TResponseHotelDTO & { room: TResponseRoomDTO })[]; total: number; message: string }>
}

export interface IGetHotelAnalyticsUseCase {
    getHotelAnalytics(hotelId: string, period: 'week' | 'month' | 'year'): Promise<{ hotel: any, message: string }>;
}

export interface IGetHotelDetailWithRoomUseCase {
    getHotelDetailWithRoom(
        hotelId: string,
        roomId: string,
        checkIn: string,
        checkOut: string,
        rooms: number,
        adults: number,
        children: number
    ): Promise<{ hotel: TResponseHotelDTO, room: TResponseRoomDTO, otherRooms: TResponseRoomDTO[], message: string }>
}