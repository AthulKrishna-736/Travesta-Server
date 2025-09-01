import { inject, injectable } from "tsyringe";
import { IHotelRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { TOKENS } from "../../../../constants/token";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";
import { awsS3Timer } from "../../../../infrastructure/config/jwtConfig";
import { IGetAllHotelsUseCase } from "../../../../domain/interfaces/model/hotel.interface";
import { TResponseHotelData } from "../../../../domain/interfaces/model/hotel.interface";
import { HotelLookupBase } from "../../base/hotelLookup.base";
import { ResponseMapper } from "../../../../utils/responseMapper";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";
import { HotelEntity } from "../../../../domain/entities/hotel.entity";
import { HOTEL_RES_MESSAGES } from "../../../../constants/resMessages";


@injectable()
export class GetAllHotelsUseCase extends HotelLookupBase implements IGetAllHotelsUseCase {
    constructor(
        @inject(TOKENS.HotelRepository) hotelRepo: IHotelRepository,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service
    ) {
        super(hotelRepo);
    }

    async getAllHotel(
        page: number,
        limit: number,
        filters?: {
            search?: string;
            amenities?: string[];
            roomType?: string[];
            checkIn?: string;
            checkOut?: string;
            guests?: number;
            minPrice?: number;
            maxPrice?: number;
        }
    ): Promise<{ hotels: TResponseHotelData[]; total: number; message: string }> {

        const { hotels, total } = await this._hotelRepo.findAllHotels(page, limit, filters);

        if (!hotels || hotels.length === 0) {
            throw new AppError('No hotels found', HttpStatusCode.NOT_FOUND);
        }

        const hotelEntities = hotels.map(h => new HotelEntity(h));

        const mappedHotels = await Promise.all(
            hotelEntities.map(async (hotel) => {
                let signedImageUrls = await this._redisService.getHotelImageUrls(hotel.id as string);

                if (!signedImageUrls) {
                    const imageKeys = Array.isArray(hotel.images) ? hotel.images : [];
                    signedImageUrls = await Promise.all(
                        imageKeys.map(key => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt))
                    );
                    await this._redisService.storeHotelImageUrls(hotel.id as string, signedImageUrls, awsS3Timer.expiresAt);
                }

                hotel.updateHotel({ images: signedImageUrls });
                return hotel.toObject();
            })
        );

        const customHotelsMapping = mappedHotels.map(h => ResponseMapper.mapHotelToResponseDTO(h));

        return {
            hotels: customHotelsMapping,
            total,
            message: HOTEL_RES_MESSAGES.getHotels,
        };
    }
}
