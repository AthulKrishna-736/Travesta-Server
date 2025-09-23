import { inject, injectable } from "tsyringe";
import { IAmenitiesRepository } from "../../../../domain/interfaces/repositories/amenitiesRepo.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { TOKENS } from "../../../../constants/token";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";
import { awsS3Timer } from "../../../../infrastructure/config/jwtConfig";
import { IGetAllHotelsUseCase } from "../../../../domain/interfaces/model/hotel.interface";
import { HotelLookupBase } from "../../base/hotelLookup.base";
import { ResponseMapper } from "../../../../utils/responseMapper";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { HotelEntity } from "../../../../domain/entities/hotel.entity";
import { HOTEL_RES_MESSAGES } from "../../../../constants/resMessages";
import { IHotelRepository } from "../../../../domain/interfaces/repositories/hotelRepo.interface";
import { HOTEL_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { TResponseHotelDTO } from "../../../../interfaceAdapters/dtos/hotel.dto";


@injectable()
export class GetAllHotelsUseCase extends HotelLookupBase implements IGetAllHotelsUseCase {
    constructor(
        @inject(TOKENS.HotelRepository) _hotelRepository: IHotelRepository,
        @inject(TOKENS.AmenitiesRepository) private _amenitiesRepository: IAmenitiesRepository,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) {
        super(_hotelRepository);
    }

    async getAllHotel(
        page: number,
        limit: number,
        filters: { search?: string; amenities?: string[]; roomType?: string[]; checkIn?: string; checkOut?: string; guests?: number; minPrice?: number; maxPrice?: number; sort?: string }
    ): Promise<{ hotels: TResponseHotelDTO[]; total: number; message: string }> {

        let hotelAmenities: string[] = [];
        let roomAmenities: string[] = [];

        if (filters.amenities && filters.amenities.length > 0) {
            const { hotelAmenities: hAmns, roomAmenities: rAmns } =
                await this._amenitiesRepository.separateHotelAndRoomAmenities(filters.amenities);

            hotelAmenities = hAmns.map(a => a._id.toString());
            roomAmenities = rAmns.map(a => a._id.toString());
        }

        const repoFilters = {
            ...filters,
            hotelAmenities,
            roomAmenities,
        };

        console.log('hotelameniteis: ', hotelAmenities)
        console.log('room amenities', roomAmenities)
        const { hotels, total } = await this._hotelRepository.findAllHotels(page, limit, repoFilters);

        if (!hotels || hotels.length === 0) {
            throw new AppError(HOTEL_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
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

        console.log('cccccccccccccccccccccc', mappedHotels)
        const customHotelsMapping = mappedHotels.map(h => ResponseMapper.mapHotelToResponseDTO(h));

        return {
            hotels: customHotelsMapping,
            total,
            message: HOTEL_RES_MESSAGES.getHotels,
        };
    }
}
