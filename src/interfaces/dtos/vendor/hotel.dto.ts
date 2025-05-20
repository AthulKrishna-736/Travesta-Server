import { Types } from "mongoose";

//hotel
export interface CreateHotelDTO {
    vendorId: string | Types.ObjectId;
    name: string;
    description: string;
    images: string[];
    rating?: number;
    services?: string[];
    amenities?: string[];
    tags?: string[];
    state: string;
    city: string;
    address: string;
    geoLocation: [number, number];
    isBlocked?: boolean;
}

export interface UpdateHotelDTO {
    vendorId?: string | Types.ObjectId;
    name?: string;
    description?: string;
    images?: string[];
    rating?: number;
    services?: string[];
    amenities?: string[];
    tags?: string[];
    state?: string;
    city?: string;
    address?: string;
    geoLocation?: [number, number];
    isBlocked?: boolean;
}


//rooms
export interface CreateRoomDTO {
    hotelId: string | Types.ObjectId;
    name: string;
    capacity: number;
    bedType: string;
    amenities: string[];
    images: string[];
    basePrice: number;
    isAvailable?: boolean;
}

export interface UpdateRoomDTO {
    hotelId?: string | Types.ObjectId;
    name?: string;
    capacity?: number;
    bedType?: string;
    amenities?: string[];
    images?: string[];
    basePrice?: number;
    isAvailable?: boolean;
}


export interface ResponseHotelDTO {
    id: string;
    vendorId: string;
    name: string;
    description: string;
    images: string[]; 
    rating: number;
    services: string[];
    amenities: string[];
    tags: string[];
    state: string;
    city: string;
    address: string;
    geoLocation: [number, number];
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
}
