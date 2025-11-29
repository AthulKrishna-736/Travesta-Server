import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { IHotelRepository } from "../../../../domain/interfaces/repositories/hotelRepo.interface";
import { awsS3Timer } from "../../../../infrastructure/config/jwtConfig";
import { AppError } from "../../../../utils/appError";
import { HOTEL_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { IGetTrendingHotelsUseCase } from "../../../../domain/interfaces/model/hotel.interface";

@injectable()
export class GetTrendingHotelsUseCase implements IGetTrendingHotelsUseCase {
    constructor(
        @inject(TOKENS.HotelRepository) private _hotelRepository: IHotelRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) { }

    async trendingHotels(checkIn: string, checkOut: string): Promise<any> {

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkInDate >= checkOutDate) {
            throw new AppError("Invalid date range", HttpStatusCode.BAD_REQUEST);
        }

        const hotels = await this._hotelRepository.getTrendingHotels(checkInDate, checkOutDate);

        if (!hotels || hotels.length === 0) {
            throw new AppError(HOTEL_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        // map hotel + room images from S3
        const mappedHotels = await Promise.all(
            hotels.map(async (h: any) => {

                if (h.images?.length) {
                    h.images = await Promise.all(
                        h.images.map((img: string) => this._awsS3Service.getFileUrlFromAws(img, awsS3Timer.expiresAt))
                    );
                }

                return h;
            })
        );

        return {
            hotels: mappedHotels,
            message: "Fetched trending hotels successfully"
        };
    }
}
