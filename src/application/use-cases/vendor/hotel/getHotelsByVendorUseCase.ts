import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { IHotelRepository } from "../../../../domain/interfaces/repositories/hotelRepo.interface";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { IGetVendorHotelsUseCase } from "../../../../domain/interfaces/model/hotel.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { awsS3Timer } from "../../../../infrastructure/config/jwtConfig";
import { ResponseMapper } from "../../../../utils/responseMapper";
import { HOTEL_RES_MESSAGES } from "../../../../constants/resMessages";
import { HOTEL_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { TResponseHotelDTO } from "../../../../interfaceAdapters/dtos/hotel.dto";


@injectable()
export class GetVendorHotelsUseCase implements IGetVendorHotelsUseCase {
    constructor(
        @inject(TOKENS.HotelRepository) private _hotelRepository: IHotelRepository,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) { }

    async getVendorHotels(vendorId: string, page: number, limit: number, search?: string): Promise<{ hotels: TResponseHotelDTO[]; total: number; message: string; }> {
        const { hotels, total } = await this._hotelRepository.findHotelsByVendor(vendorId, page, limit, search);
        if (!hotels) {
            throw new AppError(HOTEL_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const signUrlHotels = await Promise.all(
            hotels.map(async (h, index) => {
                const hotelId = h._id?.toString() as string;
                let signedImageUrls = await this._redisService.getHotelImageUrls(hotelId);

                if (!signedImageUrls) {
                    const imageKeys = Array.isArray(h.images) ? h.images : [];
                    signedImageUrls = await Promise.all(
                        imageKeys.map(key => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt))
                    )
                    await this._redisService.storeHotelImageUrls(hotelId, signedImageUrls, awsS3Timer.expiresAt)
                    console.log
                }
                return {
                    ...h,
                    images: signedImageUrls,
                }
            })
        );

        const mappedHotels = signUrlHotels.map(h => ResponseMapper.mapHotelToResponseDTO(h));

        return {
            hotels: mappedHotels,
            total,
            message: HOTEL_RES_MESSAGES.getHotels,
        }
    }

    async getVendorHotel(vendorId: string, hotelId: string): Promise<{ hotel: TResponseHotelDTO; message: string; }> {
        const hotel = await this._hotelRepository.findHotelByVendor(vendorId, hotelId);
        if (!hotel) {
            throw new AppError(HOTEL_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        let signedHotelUrls = await this._redisService.getHotelImageUrls(hotel._id as string);
        if (!signedHotelUrls) {
            const imageKeys = Array.isArray(hotel.images) ? hotel.images : [];
            signedHotelUrls = await Promise.all(
                imageKeys.map(key => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt))
            );
            await this._redisService.storeHotelImageUrls(hotel._id as string, signedHotelUrls, awsS3Timer.expiresAt)
        }

        hotel.images = signedHotelUrls;

        const mappedHotel = ResponseMapper.mapHotelToResponseDTO(hotel);

        return {
            hotel: mappedHotel,
            message: HOTEL_RES_MESSAGES.getHotels,
        }
    }
}


