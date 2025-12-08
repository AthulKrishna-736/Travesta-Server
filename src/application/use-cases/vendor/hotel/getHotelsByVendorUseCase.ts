import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { IHotelRepository } from "../../../../domain/interfaces/repositories/hotelRepo.interface";
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
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) { }

    async getVendorHotels(vendorId: string, page: number, limit: number, search?: string): Promise<{ hotels: TResponseHotelDTO[]; total: number; message: string; }> {
        const { hotels, total } = await this._hotelRepository.findHotelsByVendor(vendorId, page, limit, search);
        if (!hotels) {
            throw new AppError(HOTEL_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const mappedHotelImages = await Promise.all(
            hotels.map(async (h) => {
                if (!h.images || h.images.length <= 0) {
                    throw new AppError(HOTEL_ERROR_MESSAGES.noImagesfound, HttpStatusCode.NOT_FOUND);
                }

                const signedHotelImages = await Promise.all(h.images.map(key => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt)))

                return {
                    ...h,
                    images: signedHotelImages,
                }
            })
        );

        const mappedHotels = mappedHotelImages.map(h => ResponseMapper.mapHotelToResponseDTO(h));

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

        if (!hotel.images || hotel.images.length <= 0) {
            throw new AppError(HOTEL_ERROR_MESSAGES.noImagesfound, HttpStatusCode.NOT_FOUND);
        }

        const signedHotelImages = await Promise.all(hotel.images.map(key => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt)));
        hotel.images = signedHotelImages;

        const mappedHotel = ResponseMapper.mapHotelToResponseDTO(hotel);

        return {
            hotel: mappedHotel,
            message: HOTEL_RES_MESSAGES.getHotels,
        }
    }
}


