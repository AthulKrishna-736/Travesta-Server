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
        type: string,
        coordinates: [number, number]
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
    address: string;
    geoLocation: {
        type: string,
        coordinates: [number, number]
    };
    isBlocked: boolean;
    room?: object | null;
    createdAt: Date;
    updatedAt: Date;
}
