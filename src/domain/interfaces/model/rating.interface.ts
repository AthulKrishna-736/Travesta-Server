import { Types } from "mongoose";
import { TCreateRatingDTO, TResponseRatingDTO, TUpdateRatingDTO } from "../../../interfaceAdapters/dtos/rating.dto";

//rating model
export interface IRating {
    _id?: string;
    hotelId: Types.ObjectId | string;
    userId: Types.ObjectId | string;
    hospitality: number;
    cleanliness: number;
    facilities: number;
    room: number;
    moneyValue: number;
    review: string;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
}

export type TCreateRating = Omit<IRating, '_id' | 'createdAt' | 'updatedAt'>
export type TUpdateRating = Partial<Omit<IRating, '_id'>>;
export type TResponseRating = IRating;


export interface ICreateRatingUseCase {
    createRating(create: TCreateRatingDTO): Promise<{ rating: TResponseRatingDTO, message: string }>;
}

export interface IUpdateRatingUseCase {
    updateRating(ratingId: string, update: TUpdateRatingDTO): Promise<{ rating: TResponseRatingDTO, message: string }>
}

export interface IGetRatingUseCase {
    getAllRatings(): Promise<{ ratings: TResponseRatingDTO[], message: string }>
    getUserRatings(userId: string): Promise<{ ratings: TResponseRatingDTO[], message: string }>
    getHotelRatings(hotelId: string, page: number, limit: number): Promise<{ ratings: TResponseRatingDTO[], total: number, message: string }>
}