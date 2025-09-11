import { inject, injectable } from "tsyringe";
import { ICreateHotelUseCase } from "../../../../domain/interfaces/model/hotel.interface";
import { IHotelRepository, IUserRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { TOKENS } from "../../../../constants/token";
import { TCreateHotelData, TResponseHotelData } from "../../../../domain/interfaces/model/hotel.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { HotelLookupBase } from "../../base/hotelLookup.base";
import { AwsImageUploader } from "../../base/imageUploader";
import { ResponseMapper } from "../../../../utils/responseMapper";
import { HOTEL_RES_MESSAGES } from "../../../../constants/resMessages";


@injectable()
export class CreateHotelUseCase extends HotelLookupBase implements ICreateHotelUseCase {
    private _imageUploader;
    constructor(
        @inject(TOKENS.HotelRepository) _hotelRepository: IHotelRepository,
        @inject(TOKENS.AwsS3Service) _awsS3Service: IAwsS3Service,
        @inject(TOKENS.UserRepository) private _userRepo: IUserRepository,
    ) {
        super(_hotelRepository);
        this._imageUploader = new AwsImageUploader(_awsS3Service);
    }

    async createHotel(hotelData: TCreateHotelData, files: Express.Multer.File[]): Promise<{ hotel: TResponseHotelData; message: string }> {
        const vendor = await this._userRepo.findUserById(hotelData.vendorId as string);
        if (!vendor?.isVerified) {
            throw new AppError('Vendor is not verified. Please upload docs and verify!', HttpStatusCode.CONFLICT);
        }

        const existingHotels = await this.getHotelEntityByVendorId(hotelData.vendorId as string, 1, 100);
        const isDuplicate = existingHotels?.some(hotel => hotel.name === hotelData.name);

        if (isDuplicate) {
            throw new AppError("Hotel with the same name already exists for this vendor.", HttpStatusCode.BAD_REQUEST);
        }

        let uploadedImageKeys;

        if (files) {
            uploadedImageKeys = await this._imageUploader.uploadHotelImages(hotelData.vendorId as string, files);
        }

        const newHotel = await this._hotelRepository.createHotel({
            ...hotelData,
            amenities: hotelData.amenities,
            tags: hotelData.tags,
            images: uploadedImageKeys as string[],
        });

        if (!newHotel) {
            throw new AppError("Failed to create hotel", HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const customHotelMapping = ResponseMapper.mapHotelToResponseDTO(newHotel);

        return {
            hotel: customHotelMapping,
            message: HOTEL_RES_MESSAGES.create,
        };
    }
}

