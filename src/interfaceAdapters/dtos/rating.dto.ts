import { Types } from "mongoose"


export type TCreateRatingDTO = {
    hotelId: Types.ObjectId | string;
    userId: Types.ObjectId | string;
    hospitality: number;
    cleanliness: number;
    facilities: number;
    room: number;
    moneyValue: number;
}

export type TUpdateRating = {
    id: Types.ObjectId | string;
    hotelId?: Types.ObjectId | string;
    userId?: Types.ObjectId | string;
    hospitality?: number;
    cleanliness?: number;
    facilities?: number;
    room?: number;
    moneyValue?: number;
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
    createdAt: Date;
    updatedAt: Date;
}