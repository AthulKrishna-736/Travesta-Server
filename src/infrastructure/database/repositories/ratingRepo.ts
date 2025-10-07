import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepo";
import { ratingModel, TRatingDocument, } from "../models/ratingModel";
import { IRatingRepository } from "../../../domain/interfaces/repositories/ratingRepo.interface";
import { TCreateRating, IRating, TUpdateRating } from "../../../domain/interfaces/model/rating.interface";


@injectable()
export class RatingRepository extends BaseRepository<TRatingDocument> implements IRatingRepository {
    constructor() {
        super(ratingModel);
    }

    async createRating(create: TCreateRating): Promise<IRating> {
        const rating = await this.create(create);
        return rating;
    }

    async updateRating(ratingId: string, update: TUpdateRating): Promise<IRating | null> {
        const rating = await this.update(ratingId, update);
        return rating;
    }

    async getRatingById(ratingId: string): Promise<IRating | null> {
        const rating = await this.findById(ratingId);
        return rating;
    }

    async getUserRatings(userId: string): Promise<IRating[] | null> {
        const ratings = await this.model.find({ userId: userId }).exec();
        return ratings;
    }

    async getAllRatings(): Promise<IRating[] | null> {
        const ratings = await this.model.find().exec();
        return ratings;
    }

    async getHotelRatings(hotelId: string): Promise<IRating[] | null> {
        const ratings = await this.model.find({ hotelId: hotelId }).exec();
        return ratings;
    }
} 