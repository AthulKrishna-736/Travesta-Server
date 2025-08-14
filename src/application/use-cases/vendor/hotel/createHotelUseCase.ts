import { inject, injectable } from "tsyringe";
import { ICreateHotelUseCase } from "../../../../domain/interfaces/model/hotel.interface";
import { IHotelRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { TOKENS } from "../../../../constants/token";
import { TCreateHotelData, TResponseHotelData } from "../../../../domain/interfaces/model/hotel.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";
import { HotelLookupBase } from "../../base/hotelLookup.base";
import { AwsImageUploader } from "../../base/imageUploader";
import { ResponseMapper } from "../../../../utils/responseMapper";


@injectable()
export class CreateHotelUseCase extends HotelLookupBase implements ICreateHotelUseCase {
    private _imageUploader;
    constructor(
        @inject(TOKENS.HotelRepository) hotelRepo: IHotelRepository,
        @inject(TOKENS.AwsS3Service) awsS3Service: IAwsS3Service,
    ) {
        super(hotelRepo);
        this._imageUploader = new AwsImageUploader(awsS3Service);
    }

    async createHotel(hotelData: TCreateHotelData, files: Express.Multer.File[]): Promise<{ hotel: TResponseHotelData; message: string }> {
        const existingHotels = await this.getHotelEntityByVendorId(hotelData.vendorId as string);
        const isDuplicate = existingHotels?.some(hotel => hotel.name === hotelData.name);

        if (isDuplicate) {
            throw new AppError("Hotel with the same name already exists for this vendor.", HttpStatusCode.BAD_REQUEST);
        }

        let uploadedImageKeys;

        if (files) {
            uploadedImageKeys = await this._imageUploader.uploadHotelImages(hotelData.vendorId as string, files);
        }

        const newHotel = await this._hotelRepo.createHotel({
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
            message: "Hotel created successfully"
        };
    }
}

