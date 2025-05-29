import { inject, injectable } from "tsyringe";
import { IHotelRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { TOKENS } from "../../../../constants/token";
import { TUpdateHotelData, TResponseHotelData } from "../../../../domain/interfaces/model/hotel.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";
import fs from 'fs';
import path from 'path';
import { IUpdateHotelUseCase } from "../../../../domain/interfaces/model/usecases.interface";


@injectable()
export class UpdateHotelUseCase implements IUpdateHotelUseCase {
    constructor(
        @inject(TOKENS.HotelRepository) private _hotelRepo: IHotelRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) { }

    async execute(hotelId: string, updateData: TUpdateHotelData, files?: Express.Multer.File[]): Promise<{ hotel: TResponseHotelData; message: string }> {
        const hotel = await this._hotelRepo.findHotelById(hotelId);

        if (!hotel) {
            throw new AppError("Hotel not found", HttpStatusCode.NOT_FOUND);
        }

        if (updateData.name && updateData.name !== hotel.name) {
            const vendorHotels = await this._hotelRepo.findHotelsByVendor(hotel.vendorId.toString());

            if (vendorHotels && vendorHotels.some(h => h.name === updateData.name && h._id!.toString() !== hotelId)) {
                throw new AppError("Hotel name already exists for this vendor", HttpStatusCode.BAD_REQUEST);
            }
        }

        const parseCSV = (value: any): string[] => {
            if (typeof value === "string") {
                return value
                    .split(",")
                    .map(v => v.trim())
                    .filter(Boolean);
            }
            return Array.isArray(value) ? value : [];
        };

        let uploadedImageKeys: string[] = hotel.images ?? [];

        if (files && files.length > 0) {
            for (const key of uploadedImageKeys) {
                await this._awsS3Service.deleteFileFromAws(key);
            }

            uploadedImageKeys = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const ext = path.extname(file.originalname);
                const s3Key = `hotels/${hotel.vendorId}_${Date.now()}_${i}${ext}`;

                try {
                    await this._awsS3Service.uploadFileToAws(s3Key, file.path);
                    uploadedImageKeys.push(s3Key);
                } catch (err) {
                    console.error("Upload failed", err);
                    throw new AppError("Image upload failed", HttpStatusCode.INTERNAL_SERVER_ERROR);
                } finally {
                    fs.unlink(file.path, err => {
                        if (err) console.error("Failed to delete temp file", err);
                    });
                }
            }
        }

        const updatedHotel = await this._hotelRepo.updateHotel(hotelId, {
            ...updateData,
            tags: parseCSV(updateData.tags),
            services: parseCSV(updateData.services),
            amenities: parseCSV(updateData.amenities),
            images: uploadedImageKeys,
        });

        if (!updatedHotel) {
            throw new AppError("Failed to update hotel", HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return {
            hotel: updatedHotel,
            message: "Hotel updated successfully"
        };
    }

}