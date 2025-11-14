import { inject, injectable } from "tsyringe";
import { IUpdateRatingUseCase } from "../../../domain/interfaces/model/rating.interface";
import { TOKENS } from "../../../constants/token";
import { IRatingRepository } from "../../../domain/interfaces/repositories/ratingRepo.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { ResponseMapper } from "../../../utils/responseMapper";
import { TResponseRatingDTO, TUpdateRatingDTO } from "../../../interfaceAdapters/dtos/rating.dto";

@injectable()
export class UpdateRatingUseCase implements IUpdateRatingUseCase {
    constructor(
        @inject(TOKENS.RatingRepository) private _ratingRepository: IRatingRepository,
    ) { }

    async updateRating(ratingId: string, update: TUpdateRatingDTO): Promise<{ rating: TResponseRatingDTO, message: string }> {

        const existing = await this._ratingRepository.getRatingById(ratingId);
        if (!existing) {
            throw new AppError("Rating not found", HttpStatusCode.NOT_FOUND);
        }

        const updated = await this._ratingRepository.updateRating(ratingId, update);

        if (!updated) {
            throw new AppError("Failed to update rating", HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const mapped = ResponseMapper.mapRatingToResponseDTO(updated);

        return {
            rating: mapped,
            message: 'Rating updated successfully',
        };
    }
}
