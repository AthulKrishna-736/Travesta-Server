import { Types } from "mongoose";


export type TCreateRoomDTO = {
    hotelId: string | Types.ObjectId;
    name: string;
    capacity: number;
    bedType: string;
    amenities: string[];
    images: string[];
    basePrice: number;
}

export type TUpdateRoomDTO = {
    hotelId?: string | Types.ObjectId;
    name?: string;
    capacity?: number;
    bedType?: string;
    amenities?: string[];
    images?: string[];
    basePrice?: number;
}

export type TResponseRoomDTO = {
    id: string
    hotelId: string
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

