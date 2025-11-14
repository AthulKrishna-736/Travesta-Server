import { inject, injectable } from "tsyringe";
import { ICreateRatingUseCase, TCreateRating } from "../../../domain/interfaces/model/rating.interface";
import { IRatingRepository } from "../../../domain/interfaces/repositories/ratingRepo.interface";
import { TOKENS } from "../../../constants/token";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { ResponseMapper } from "../../../utils/responseMapper";
import { TCreateRatingDTO, TResponseRatingDTO } from "../../../interfaceAdapters/dtos/rating.dto";

@injectable()
export class CreateRatingUseCase implements ICreateRatingUseCase {
    constructor(
        @inject(TOKENS.RatingRepository) private _ratingRepository: IRatingRepository,
    ) { }

    async createRating(createData: TCreateRatingDTO): Promise<{ rating: TResponseRatingDTO, message: string }> {

        const exists = await this._ratingRepository.findUserDuplicateHotelRatings(createData.userId, createData.hotelId);

        if (exists) {
            throw new AppError("You already reviewed this hotel", HttpStatusCode.BAD_REQUEST);
        }

        const finalData = {
            ...createData,
            images: [],
        }

        const created = await this._ratingRepository.createRating(finalData);

        if (!created) {
            throw new AppError("Failed to create rating", HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const mapped = ResponseMapper.mapRatingToResponseDTO(created);

        return {
            rating: mapped,
            message: 'User rating created successfully',
        };
    }
}
