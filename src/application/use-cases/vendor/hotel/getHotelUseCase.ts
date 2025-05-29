import { inject, injectable } from "tsyringe";
import { IHotelRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { TOKENS } from "../../../../constants/token";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";
import { IGetHotelByIdUseCase } from "../../../../domain/interfaces/model/usecases.interface";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";
import { TResponseHotelData } from "../../../../domain/interfaces/model/hotel.interface";
import { awsS3Timer } from "../../../../infrastructure/config/jwtConfig";


@injectable()
export class GetHotelByIdUseCase implements IGetHotelByIdUseCase {
    constructor(
        @inject(TOKENS.HotelRepository) private _hotelRepo: IHotelRepository,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) { }

    async execute(hotelId: string): Promise<{ hotel: TResponseHotelData; message: string }> {
        const hotel = await this._hotelRepo.findHotelById(hotelId);
        if (!hotel) throw new AppError("Hotel not found", HttpStatusCode.NOT_FOUND);

        let signedImageUrls = await this._redisService.getHotelImageUrls(hotelId);

        if (!signedImageUrls) {
            signedImageUrls = await Promise.all(
                hotel.images.map(key => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt))
            );

            await this._redisService.storeHotelImageUrls(hotelId, signedImageUrls, awsS3Timer.expiresAt);
        }

        const mapHotel: TResponseHotelData = {
            ...hotel,
            images: signedImageUrls,
        };


        return { hotel: mapHotel, message: "Hotel fetched successfully" };
    }
}