import { Types } from "mongoose";

//hotel
export type TCreateHotelDTO = {
    vendorId: string | Types.ObjectId;
    name: string;
    description: string;
    images: string[];
    rating?: number;
    amenities: string[];
    tags: string[];
    state: string;
    city: string;
    address: string;
    geoLocation: [number, number];
}

export type TUpdateHotelDTO = {
    name?: string;
    description?: string;
    images?: string[];
    rating?: number;
    amenities?: string[];
    tags?: string[];
    state?: string;
    city?: string;
    address?: string;
    geoLocation?: [number, number];
}

export type TResponseHotelDTO = {
    id: string;
    vendorId: string;
    name: string;
    description: string;
    images: string[];
    rating: number;
    amenities: string[];
    tags: string[];
    state: string;
    city: string;
    address: string;
    geoLocation: [number, number];
    isBlocked: boolean;
    startingPrice?: number | null;
    cheapestRoom?: {
        _id: string;
        name: string;
        basePrice: number;
    } | null;
    createdAt: Date;
    updatedAt: Date;
}
