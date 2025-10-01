import { Types } from "mongoose";
import { TBedType, TRoomType } from "../../domain/interfaces/model/room.interface";

export type TCreateRoomDTO = {
    hotelId: string | Types.ObjectId;
    name: string;
    roomType: TRoomType;
    roomCount: number;
    bedType: TBedType;
    guest: number;
    amenities: string[];
    images: string[];
    basePrice: number;
}

export type TUpdateRoomDTO = {
    hotelId?: string | Types.ObjectId;
    name?: string;
    roomCount?: number;
    roomType?: TRoomType;
    guest?: number;
    bedType?: TBedType;
    amenities?: string[];
    images?: string[];
    basePrice?: number;
}

export type TResponseRoomDTO = {
    id: string;
    hotelId: string | Object;
    name: string;
    roomCount: number;
    roomType: TRoomType;
    guest: number;
    bedType: TBedType;
    amenities: string[];
    images: string[];
    basePrice: number;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}

