import { inject, injectable } from "tsyringe";
import { IHotelRepository } from "../../../../domain/interfaces/repositories/hotelRepo.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { TOKENS } from "../../../../constants/token";
import { IGetHotelByIdUseCase } from "../../../../domain/interfaces/model/hotel.interface";
import { awsS3Timer } from "../../../../infrastructure/config/jwtConfig";
import { ResponseMapper } from "../../../../utils/responseMapper";
import { HOTEL_RES_MESSAGES } from "../../../../constants/resMessages";
import { TResponseHotelDTO } from "../../../../interfaceAdapters/dtos/hotel.dto";
import { AppError } from "../../../../utils/appError";
import { HOTEL_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";


@injectable()
export class GetHotelByIdUseCase implements IGetHotelByIdUseCase {
    constructor(
        @inject(TOKENS.HotelRepository) private _hotelRepository: IHotelRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) { }

    async getHotelById(hotelId: string): Promise<{ hotel: TResponseHotelDTO; message: string }> {

        const hotel = await this._hotelRepository.findHotelById(hotelId);
        if (!hotel) {
            throw new AppError(HOTEL_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        if (!hotel.images || hotel.images.length <= 0) {
            throw new AppError(HOTEL_ERROR_MESSAGES.noImagesfound, HttpStatusCode.NOT_FOUND);
        }

        const signedHotelImages = await Promise.all(
            hotel.images.map(key => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt))
        );
        hotel.images = signedHotelImages;

        const customHotelMapping = ResponseMapper.mapHotelToResponseDTO(hotel);

        return { hotel: customHotelMapping, message: HOTEL_RES_MESSAGES.getHotelById };
    }
}