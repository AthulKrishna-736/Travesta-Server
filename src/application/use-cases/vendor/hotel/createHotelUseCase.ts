import { inject, injectable } from "tsyringe";
import { ICreateHotelUseCase } from "../../../../domain/interfaces/model/usecases.interface";
import { IHotelRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { TOKENS } from "../../../../constants/token";
import { TCreateHotelData, TResponseHotelData } from "../../../../domain/interfaces/model/hotel.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";
import fs from 'fs';
import path from 'path';
import { HotelLookupBase } from "../../base/hotelLookup.base";
import { HotelImageUploader } from "../../base/imageUploader";


@injectable()
export class CreateHotelUseCase extends HotelLookupBase implements ICreateHotelUseCase {
    private _imageUploader;
    constructor(
        @inject(TOKENS.HotelRepository) hotelRepo: IHotelRepository,
        @inject(TOKENS.AwsS3Service) awsS3Service: IAwsS3Service,
    ) {
        super(hotelRepo);
        this._imageUploader = new HotelImageUploader(awsS3Service);
    }

    async createHotel(hotelData: TCreateHotelData, files: Express.Multer.File[]): Promise<{ hotel: TResponseHotelData; message: string }> {
        const existingHotels = await this.getHotelEntityByVendorId(hotelData.vendorId as string);
        const isDuplicate = existingHotels?.some(hotel => hotel.name === hotelData.name);

        if (isDuplicate) {
            throw new AppError("Hotel with the same name already exists for this vendor.", HttpStatusCode.BAD_REQUEST);
        }

        const uploadedImageKeys = await this._imageUploader.uploadHotelImages(hotelData.vendorId as string, files!);

        const parseCSV = (value: any): string[] => {
            if (typeof value === "string") {
                return value
                    .split(",")
                    .map(item => item.trim())
                    .filter(item => item.length > 0);
            }
            return Array.isArray(value) ? value : [];
        };

        const newHotel = await this._hotelRepo.createHotel({
            ...hotelData,
            services: parseCSV(hotelData.services),
            amenities: parseCSV(hotelData.amenities),
            tags: parseCSV(hotelData.tags),
            images: uploadedImageKeys,
        });

        if (!newHotel) {
            throw new AppError("Failed to create hotel", HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return {
            hotel: newHotel,
            message: "Hotel created successfully"
        };
    }
}

