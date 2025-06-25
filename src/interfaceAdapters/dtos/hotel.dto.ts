import { Types } from "mongoose";

//hotel
export type TCreateHotelDTO = {
    vendorId: string | Types.ObjectId;
    name: string;
    description: string;
    images: string[];
    rating?: number;
    services: string[];
    amenities: string[];
    tags: string[];
    state: string;
    city: string;
    address: string;
    geoLocation: [number, number];
    isBlocked?: boolean;
}

export type TUpdateHotelDTO = {
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

export type TResponseHotelDTO = {
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
