import { inject, injectable } from "tsyringe";
import { IHotelRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { TOKENS } from "../../../../constants/token";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";
import { awsS3Timer } from "../../../../infrastructure/config/jwtConfig";
import { IGetAllHotelsUseCase } from "../../../../domain/interfaces/model/usecases.interface";
import { TResponseHotelData } from "../../../../domain/interfaces/model/hotel.interface";


@injectable()
export class GetAllHotelsUseCase implements IGetAllHotelsUseCase {
    constructor(
        @inject(TOKENS.HotelRepository) private _hotelRepo: IHotelRepository,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service
    ) { }

    async execute(page: number = 1, limit: number = 10, search?: string): Promise<{ hotels: TResponseHotelData[]; total: number; message: string; }> {
        const { hotels, total } = await this._hotelRepo.findAllHotels(page, limit, search);

        if (!hotels || hotels.length === 0) {
            return { hotels: [], total: 0, message: "No hotels found" };
        }

        const mappedHotels = await Promise.all(
            hotels.map(async (hotel) => {
                let signedImageUrls = await this._redisService.getHotelImageUrls(hotel._id as string);

                if (!signedImageUrls) {
                    signedImageUrls = await Promise.all(
                        hotel.images.map((key: string) =>
                            this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt)
                        )
                    );
                    await this._redisService.storeHotelImageUrls(hotel._id as string, signedImageUrls, awsS3Timer.expiresAt);
                }
                return {
                    ...hotel,
                    images: signedImageUrls,
                };
            })
        );

        return {
            hotels: mappedHotels,
            total,
            message: "Hotels fetched successfully",
        };
    }
}
