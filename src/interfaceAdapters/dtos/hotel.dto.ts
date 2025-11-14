import { TIdProof } from "../../domain/interfaces/model/hotel.interface";

//hotel
export type TCreateHotelDTO = {
    name: string;
    description: string;
    images: string[];
    amenities: string[];
    tags: string[];
    state: string;
    city: string;
    address: string;
    geoLocation: {
        type: string,
        coordinates: [number, number]
    };
    propertyRules: {
        checkInTime: string;
        checkOutTime: string;
        minGuestAge: number;
        petsAllowed: boolean;
        breakfastFee?: number;
        outsideFoodAllowed: boolean;
        idProofAccepted: TIdProof[];
        specialNotes?: string;
    };
}

export type TUpdateHotelDTO = {
    name?: string;
    description?: string;
    images?: string[];
    amenities?: string[];
    tags?: string[];
    state?: string;
    city?: string;
    address?: string;
    geoLocation?: {
        type?: string,
        coordinates?: [number, number];
    };
    propertyRules?: {
        checkInTime?: string;
        checkOutTime?: string;
        minGuestAge?: number;
        petsAllowed?: boolean;
        breakfastFee?: number;
        outsideFoodAllowed?: boolean;
        idProofAccepted?: TIdProof[];
        specialNotes?: string;
    };
}

export type TResponseHotelDTO = {
    id: string;
    vendorId: string;
    name: string;
    description: string;
    images: string[];
    amenities: string[];
    tags: string[];
    state: string;
    city: string;
    rating?: object
    address: string;
    geoLocation: {
        type: string,
        coordinates: [number, number]
    };
    propertyRules: {
        checkInTime: string;
        checkOutTime: string;
        minGuestAge: number;
        petsAllowed: boolean;
        breakfastFee?: number;
        outsideFoodAllowed: boolean;
        idProofAccepted: TIdProof[];
        specialNotes?: string;
    };
    isBlocked: boolean;
    room?: object | null;
    createdAt: Date;
    updatedAt: Date;
}
