import { inject, injectable } from "tsyringe";
import { IGetRatingUseCase } from "../../../domain/interfaces/model/rating.interface";
import { TOKENS } from "../../../constants/token";
import { IRatingRepository } from "../../../domain/interfaces/repositories/ratingRepo.interface";
import { ResponseMapper } from "../../../utils/responseMapper";
import { TResponseRatingDTO } from "../../../interfaceAdapters/dtos/rating.dto";
import { IAwsS3Service } from "../../../domain/interfaces/services/awsS3Service.interface";
import { awsS3Timer } from "../../../infrastructure/config/jwtConfig";
import { IHotelRepository } from "../../../domain/interfaces/repositories/hotelRepo.interface";
import { AppError } from "../../../utils/appError";
import { HOTEL_ERROR_MESSAGES } from "../../../constants/errorMessages";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";

@injectable()
export class GetRatingUseCase implements IGetRatingUseCase {
    constructor(
        @inject(TOKENS.RatingRepository) private _ratingRepository: IRatingRepository,
        @inject(TOKENS.HotelRepository) private _hotelRepository: IHotelRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
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

        const signImages = await Promise.all(
            ratings.map(async (r) => {
                const user = r.userId as any;
                if (user && typeof user === "object" && typeof user.profileImage === "string") {
                    user.profileImage = await this._awsS3Service.getFileUrlFromAws(user.profileImage, awsS3Timer.expiresAt);
                }

                return r;
            })
        );

        const mapped = signImages.map(ResponseMapper.mapRatingToResponseDTO);
        return {
            ratings: mapped,
            message: 'Ratings fetched successfully',
        };
    }

    async getHotelRatings(hotelSlug: string, page: number, limit: number): Promise<{ ratings: TResponseRatingDTO[]; total: number; message: string; }> {
        const hotel = await this._hotelRepository.findHotelBySlug(hotelSlug);
        if (!hotel || !hotel._id) throw new AppError(HOTEL_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);

        const { ratings, total } = await this._ratingRepository.getHotelRatings(hotel._id, page, limit);
        if (!ratings || total === 0) {
            return { ratings: [], total: 0, message: 'No ratings found' };
        }

        const mapped = ratings.map(ResponseMapper.mapRatingToResponseDTO);
        return {
            ratings: mapped,
            total,
            message: 'Ratings fetched successfully',
        };
    }
}
