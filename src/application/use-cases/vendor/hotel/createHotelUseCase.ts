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


@injectable()
export class CreateHotelUseCase implements ICreateHotelUseCase {
    constructor(
        @inject(TOKENS.HotelRepository) private _hotelRepo: IHotelRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) { }

    async execute(hotelData: TCreateHotelData, files?: Express.Multer.File[]): Promise<{ hotel: TResponseHotelData; message: string }> {
        const existingHotels = await this._hotelRepo.findHotelsByVendor(hotelData.vendorId as string);
        const isDuplicate = existingHotels?.some(hotel => hotel.name === hotelData.name);

        if (isDuplicate) {
            throw new AppError("Hotel with the same name already exists for this vendor.", HttpStatusCode.BAD_REQUEST);
        }

        const uploadedImageKeys: string[] = [];
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileExtension = path.extname(file.originalname);
                const s3Key = `hotels/${hotelData.vendorId}_${Date.now()}_${i}${fileExtension}`;

                try {
                    await this._awsS3Service.uploadFileToAws(s3Key, file.path);
                    uploadedImageKeys.push(s3Key);
                } catch (error) {
                    console.error(`Failed to upload file ${file.originalname}:`, error);
                    throw new AppError("Error uploading hotel images", HttpStatusCode.INTERNAL_SERVER_ERROR);
                } finally {
                    fs.unlink(file.path, (err) => {
                        if (err) {
                            console.error(`Error deleting local file: ${file.path}`);
                        }
                    });
                }
            }
        }

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

