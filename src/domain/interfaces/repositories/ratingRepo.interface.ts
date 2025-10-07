import { IRating, TCreateRating, TUpdateRating } from "../model/rating.interface";

export interface IRatingRepository {
    createRating(create: TCreateRating): Promise<IRating>;
    updateRating(ratingId: string, update: TUpdateRating): Promise<IRating | null>;
    getRatingById(ratingId: string): Promise<IRating | null>;
    getAllRatings(): Promise<IRating[] | null>;
    getUserRatings(userId: string): Promise<IRating[] | null>;
    getHotelRatings(hotelId: string): Promise<IRating[] | null>;
}