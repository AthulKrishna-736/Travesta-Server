import { inject, injectable } from "tsyringe";
import { IHotelRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { TOKENS } from "../../../../constants/token";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";
import { awsS3Timer } from "../../../../infrastructure/config/jwtConfig";
import { IGetAllHotelsUseCase } from "../../../../domain/interfaces/model/hotel.interface";
import { TResponseHotelData } from "../../../../domain/interfaces/model/hotel.interface";
import { HotelLookupBase } from "../../base/hotelLookup.base";


@injectable()
export class GetAllHotelsUseCase extends HotelLookupBase implements IGetAllHotelsUseCase {
    constructor(
        @inject(TOKENS.HotelRepository) hotelRepo: IHotelRepository,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service
    ) {
        super(hotelRepo);
    }

    async getAllHotel(page: number, limit: number, search?: string): Promise<{ hotels: TResponseHotelData[]; total: number; message: string; }> {
        const { hotels, total } = await this.getAllHotels(page, limit, search);

        const mappedHotels = await Promise.all(
            hotels.map(async (hotel) => {
                let signedImageUrls = await this._redisService.getHotelImageUrls(hotel.id as string);
                if (!signedImageUrls) {
                    const imageKeys = Array.isArray(hotel.images) ? hotel.images : [];
                    signedImageUrls = await Promise.all(
                        imageKeys.map((key: string) => {
                            return this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt)
                        })
                    );

                    await this._redisService.storeHotelImageUrls(hotel.id as string, signedImageUrls, awsS3Timer.expiresAt);
                }
                hotel.updateHotel({ images: signedImageUrls });

                return hotel.toObject()
            })
        );

        return {
            hotels: mappedHotels,
            total,
            message: "Hotels fetched successfully",
        };
    }
}
