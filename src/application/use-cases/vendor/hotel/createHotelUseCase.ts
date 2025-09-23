import { inject, injectable } from "tsyringe";
import { ICreateHotelUseCase } from "../../../../domain/interfaces/model/hotel.interface";
import { IHotelRepository } from "../../../../domain/interfaces/repositories/hotelRepo.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { TOKENS } from "../../../../constants/token";
import { TCreateHotelData, TResponseHotelData } from "../../../../domain/interfaces/model/hotel.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { HotelLookupBase } from "../../base/hotelLookup.base";
import { AwsImageUploader } from "../../base/imageUploader";
import { ResponseMapper } from "../../../../utils/responseMapper";
import { HOTEL_RES_MESSAGES } from "../../../../constants/resMessages";
import { IUserRepository } from "../../../../domain/interfaces/repositories/userRepo.interface";
import { AUTH_ERROR_MESSAGES, HOTEL_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { TCreateHotelDTO, TResponseHotelDTO } from "../../../../interfaceAdapters/dtos/hotel.dto";


@injectable()
export class CreateHotelUseCase extends HotelLookupBase implements ICreateHotelUseCase {
    private _imageUploader;
    constructor(
        @inject(TOKENS.HotelRepository) _hotelRepository: IHotelRepository,
        @inject(TOKENS.AwsS3Service) _awsS3Service: IAwsS3Service,
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
    ) {
        super(_hotelRepository);
        this._imageUploader = new AwsImageUploader(_awsS3Service);
    }

    async createHotel(vendorId: string, hotelData: TCreateHotelDTO, files: Express.Multer.File[]): Promise<{ hotel: TResponseHotelDTO; message: string }> {
        const vendor = await this._userRepository.findUserById(vendorId);
        if (!vendor?.isVerified) {
            throw new AppError(AUTH_ERROR_MESSAGES.notVerified, HttpStatusCode.CONFLICT);
        }

        const isDuplicate = await this._hotelRepository.findDuplicateHotels(hotelData.name.trim());
        if (isDuplicate) {
            throw new AppError(HOTEL_ERROR_MESSAGES.nameError, HttpStatusCode.CONFLICT);
        }

        let uploadedImageKeys: string[] = [];
        if (files) {
            uploadedImageKeys = await this._imageUploader.uploadHotelImages(vendorId, files);
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

