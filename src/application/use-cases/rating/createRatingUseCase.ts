import { inject, injectable } from "tsyringe";
import { ICreateRatingUseCase } from "../../../domain/interfaces/model/rating.interface";
import { IRatingRepository } from "../../../domain/interfaces/repositories/ratingRepo.interface";
import { TOKENS } from "../../../constants/token";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { ResponseMapper } from "../../../utils/responseMapper";
import { TCreateRatingDTO, TResponseRatingDTO } from "../../../interfaceAdapters/dtos/rating.dto";
import { IBookingRepository } from "../../../domain/interfaces/repositories/bookingRepo.interface";
import { BOOKING_ERROR_MESSAGES } from "../../../constants/errorMessages";
import { AwsImageUploader } from "../base/imageUploader";
import { IAwsS3Service } from "../../../domain/interfaces/services/awsS3Service.interface";

@injectable()
export class CreateRatingUseCase implements ICreateRatingUseCase {
    private _imageUploader: AwsImageUploader;

    constructor(
        @inject(TOKENS.RatingRepository) private _ratingRepository: IRatingRepository,
        @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository,
        @inject(TOKENS.AwsS3Service) _awsS3Service: IAwsS3Service,
    ) {
        this._imageUploader = new AwsImageUploader(_awsS3Service);
    }

    async createRating(bookingId: string, createData: TCreateRatingDTO, files?: Express.Multer.File[]): Promise<{ rating: TResponseRatingDTO, message: string }> {
        const booking = await this._bookingRepository.findByid(bookingId);
        if (!booking) {
            throw new AppError(BOOKING_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const date = new Date();
        const bookingDate = new Date(booking.checkOut);

        if (booking.userId.toString() !== createData.userId) {
            throw new AppError("You are not allowed to review this booking", HttpStatusCode.FORBIDDEN);
        }

        if ((booking.hotelId as any)._id.toString() !== createData.hotelId) {
            throw new AppError('Hotel mismatch please rate the correct hotel', HttpStatusCode.FORBIDDEN);
        }

        if (date < bookingDate) {
            throw new AppError("You can rate this hotel only after checkout", HttpStatusCode.BAD_REQUEST);
        }

        const exists = await this._ratingRepository.findUserDuplicateHotelRatings(createData.userId, createData.hotelId);
        if (exists) {
            throw new AppError("You already reviewed this hotel", HttpStatusCode.BAD_REQUEST);
        }

        let imageUrls: string[] = [];

        if (files && files.length > 0) {
            imageUrls = await this._imageUploader.uploadHotelRatingImages(createData.userId, files)
        }

        //final object including images
        const finalData = {
            ...createData,
            images: imageUrls,
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
