import { inject, injectable } from "tsyringe";
import { ICreateHotelUseCase } from "../../../../domain/interfaces/model/hotel.interface";
import { IHotelRepository } from "../../../../domain/interfaces/repositories/hotelRepo.interface";
import { TOKENS } from "../../../../constants/token";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { ResponseMapper } from "../../../../utils/responseMapper";
import { HOTEL_RES_MESSAGES } from "../../../../constants/resMessages";
import { IUserRepository } from "../../../../domain/interfaces/repositories/userRepo.interface";
import { AUTH_ERROR_MESSAGES, HOTEL_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { TCreateHotelDTO, TResponseHotelDTO } from "../../../../interfaceAdapters/dtos/hotel.dto";
import { IAwsImageUploader } from "../../../../domain/interfaces/model/admin.interface";


@injectable()
export class CreateHotelUseCase implements ICreateHotelUseCase {
    constructor(
        @inject(TOKENS.HotelRepository) private _hotelRepository: IHotelRepository,
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.AwsImageUploader) private _awsImageUploader: IAwsImageUploader,
    ) { }

    async createHotel(vendorId: string, hotelData: TCreateHotelDTO, files: Express.Multer.File[]): Promise<{ hotel: TResponseHotelDTO; message: string }> {
        const vendor = await this._userRepository.findUserById(vendorId);
        if (!vendor) throw new AppError(AUTH_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);

        if (!vendor.isVerified) {
            throw new AppError(AUTH_ERROR_MESSAGES.notVerified, HttpStatusCode.CONFLICT);
        }

        const isDuplicate = await this._hotelRepository.findDuplicateHotels(hotelData.name.trim());
        if (isDuplicate) {
            throw new AppError(HOTEL_ERROR_MESSAGES.nameError, HttpStatusCode.CONFLICT);
        }

        let uploadedImageKeys: string[] = [];
        if (files) {
            uploadedImageKeys = await this._awsImageUploader.uploadHotelImages(vendorId, files);
        }

        const finalHotelData: TCreateHotelDTO & { vendorId: string } = {
            ...hotelData,
            vendorId,
            images: uploadedImageKeys,
        }
        const newHotel = await this._hotelRepository.createHotel(finalHotelData);

        if (!newHotel) {
            throw new AppError(HOTEL_ERROR_MESSAGES.createFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const customHotelMapping = ResponseMapper.mapHotelToResponseDTO(newHotel);

        return {
            hotel: customHotelMapping,
            message: HOTEL_RES_MESSAGES.create,
        };
    }
}

