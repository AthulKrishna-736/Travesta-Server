import { IRating, TCreateRating, TUpdateRating } from "../model/rating.interface";

export interface IRatingRepository {
    createRating(create: TCreateRating): Promise<IRating>;
    updateRating(ratingId: string, update: TUpdateRating): Promise<IRating | null>;
    getRatingById(ratingId: string): Promise<IRating | null>;
    getAllRatings(): Promise<IRating[] | null>;
    getUserRatings(userId: string): Promise<IRating[] | null>;
    getHotelRatings(hotelId: string): Promise<IRating[] | null>;
    findUserDuplicateHotelRatings(userId: string, hotelId: string): Promise<IRating | null>
    getHotelRatingSummary(hotelId: string): Promise<{ totalRatings: number; averageRating: number; averages: { hospitality: number; cleanliness: number; facilities: number; room: number; moneyValue: number; }; }>
}