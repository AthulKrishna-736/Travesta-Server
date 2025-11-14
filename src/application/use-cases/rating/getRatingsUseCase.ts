import { inject, injectable } from "tsyringe";
import { IGetRatingUseCase } from "../../../domain/interfaces/model/rating.interface";
import { TOKENS } from "../../../constants/token";
import { IRatingRepository } from "../../../domain/interfaces/repositories/ratingRepo.interface";
import { ResponseMapper } from "../../../utils/responseMapper";
import { TResponseRatingDTO } from "../../../interfaceAdapters/dtos/rating.dto";

@injectable()
export class GetRatingUseCase implements IGetRatingUseCase {
    constructor(
        @inject(TOKENS.RatingRepository) private _ratingRepository: IRatingRepository,
    ) { }

    async getAllRatings(): Promise<{ ratings: TResponseRatingDTO[], message: string }> {
        const ratings = await this._ratingRepository.getAllRatings();
        if (!ratings || ratings.length === 0) {
            return { ratings: [], message: 'No ratings found' };
        }

        const mapped = ratings.map(ResponseMapper.mapRatingToResponseDTO);
        return {
            ratings: mapped,
            message: 'Ratings fetched successfully'
        };
    }

    async getUserRatings(userId: string): Promise<{ ratings: TResponseRatingDTO[], message: string }> {
        const ratings = await this._ratingRepository.getUserRatings(userId);
        if (!ratings || ratings.length === 0) {
            return { ratings: [], message: 'No ratings found' };
        }

        const mapped = ratings.map(ResponseMapper.mapRatingToResponseDTO);
        return {
            ratings: mapped,
            message: 'Ratings fetched successfully',
        };
    }

    async getHotelRatings(hotelId: string): Promise<{ ratings: TResponseRatingDTO[]; message: string; }> {
        const ratings = await this._ratingRepository.getHotelRatings(hotelId);
        if (!ratings || ratings.length === 0) {
            return { ratings: [], message: 'No ratings found' };
        }

        const mapped = ratings.map(ResponseMapper.mapRatingToResponseDTO);
        return {
            ratings: mapped,
            message: 'Ratings fetched successfully',
        };
    }
}
