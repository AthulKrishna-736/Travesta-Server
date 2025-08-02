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
