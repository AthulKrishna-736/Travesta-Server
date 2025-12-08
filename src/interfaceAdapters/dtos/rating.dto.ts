import { Types } from "mongoose"


export type TCreateRatingDTO = {
    hotelId: string;
    userId: string;
    hospitality: number;
    cleanliness: number;
    facilities: number;
    room: number;
    moneyValue: number;
    review: string;
    images?: string[];
}

export type TUpdateRatingDTO = {
    hotelId?: string;
    userId?: string;
    hospitality?: number;
    cleanliness?: number;
    facilities?: number;
    room?: number;
    moneyValue?: number;
    review?: string;
    images?: string[]
}

export type TResponseRatingDTO = {
    id: string;
    hotelId: Types.ObjectId | string;
    userId: Types.ObjectId | string;
    hospitality: number;
    cleanliness: number;
    facilities: number;
    room: number;
    moneyValue: number;
    review: string;
    images?: string[];
    createdAt: Date;
    updatedAt: Date;
}