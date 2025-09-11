import { inject, injectable } from "tsyringe";
import { IHotelRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { TOKENS } from "../../../../constants/token";
import { IGetHotelByIdUseCase } from "../../../../domain/interfaces/model/hotel.interface";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";
import { TResponseHotelData } from "../../../../domain/interfaces/model/hotel.interface";
import { awsS3Timer } from "../../../../infrastructure/config/jwtConfig";
import { HotelLookupBase } from "../../base/hotelLookup.base";
import { ResponseMapper } from "../../../../utils/responseMapper";
import { HOTEL_RES_MESSAGES } from "../../../../constants/resMessages";


@injectable()
export class GetHotelByIdUseCase extends HotelLookupBase implements IGetHotelByIdUseCase {
    constructor(
        @inject(TOKENS.HotelRepository) _hotelRepository: IHotelRepository,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) {
        super(_hotelRepository);
    }

    async getHotel(hotelId: string): Promise<{ hotel: TResponseHotelData; message: string }> {

        const hotel = await this.getHotelEntityById(hotelId);

        let signedImageUrls = await this._redisService.getHotelImageUrls(hotelId);

        if (!signedImageUrls) {
            signedImageUrls = await Promise.all(
                hotel.images.map(key => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt))
            );

            await this._redisService.storeHotelImageUrls(hotelId, signedImageUrls, awsS3Timer.expiresAt);
            hotel.updateHotel({ images: signedImageUrls })
        }

        const mapHotel = hotel.toObject();
        const customHotelMapping = ResponseMapper.mapHotelToResponseDTO(mapHotel);

        return { hotel: customHotelMapping, message: HOTEL_RES_MESSAGES.getHotelById };
    }
}