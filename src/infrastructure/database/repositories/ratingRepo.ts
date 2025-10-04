import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepo";
import { ratingModel, TRatingDocument, } from "../models/ratingModel";
import { IRatingRepository } from "../../../domain/interfaces/repositories/ratingRepo.interface";



@injectable()
export class RatingRepository extends BaseRepository<TRatingDocument> implements IRatingRepository {
    constructor() {
        super(ratingModel)
    }

    async

} 