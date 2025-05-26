import { inject, injectable } from "tsyringe";
import { IHotelRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { IHotel } from "../../../domain/interfaces/model/hotel.interface";
import { AppError } from "../../../utils/appError";
import { ICreateHotelUseCase, IGetAllHotelsUseCase, IGetHotelByIdUseCase, IUpdateHotelUseCase } from "../../../domain/interfaces/model/usecases.interface";
import { TOKENS } from "../../../constants/token";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { IAwsS3Service } from "../../../domain/interfaces/services/awsS3Service.interface";
import fs from 'fs';
import path from 'path';
import { IRedisService } from "../../../domain/interfaces/services/redisService.interface";
import { awsS3Timer } from "../../../infrastructure/config/jwtConfig";


@injectable()
export class CreateHotelUseCase implements ICreateHotelUseCase {
    constructor(
        @inject(TOKENS.HotelRepository) private _hotelRepo: IHotelRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) { }

    async execute(hotelData: CreateHotelDTO, files?: Express.Multer.File[]): Promise<{ hotel: IHotel; message: string }> {
        const existingHotels = await this._hotelRepo.findHotelsByVendor(hotelData.vendorId.toString());
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
            rating: hotelData.rating ?? 0,
            isBlocked: hotelData.isBlocked ?? false,
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


@injectable()
export class UpdateHotelUseCase implements IUpdateHotelUseCase {
    constructor(
        @inject(TOKENS.HotelRepository) private _hotelRepo: IHotelRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) { }

    async execute(hotelId: string, updateData: UpdateHotelDTO, files?: Express.Multer.File[]): Promise<{ hotel: IHotel; message: string }> {
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


@injectable()
export class GetHotelByIdUseCase implements IGetHotelByIdUseCase {
    constructor(
        @inject(TOKENS.HotelRepository) private _hotelRepo: IHotelRepository,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service
    ) { }

    async execute(hotelId: string): Promise<{ hotel: ResponseHotelDTO; message: string }> {
        const hotel = await this._hotelRepo.findHotelById(hotelId);
        if (!hotel) throw new AppError("Hotel not found", HttpStatusCode.NOT_FOUND);

        let signedImageUrls = await this._redisService.getHotelImageUrls(hotelId);

        if (!signedImageUrls) {
            signedImageUrls = await Promise.all(
                hotel.images.map(key => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt))
            );

            await this._redisService.storeHotelImageUrls(hotelId, signedImageUrls, awsS3Timer.expiresAt);
        }

        const mapHotel: ResponseHotelDTO = {
            id: hotel._id as string,
            vendorId: hotel.vendorId.toString(),
            name: hotel.name,
            description: hotel.description,
            rating: hotel.rating,
            services: hotel.services,
            amenities: hotel.amenities,
            tags: hotel.tags,
            state: hotel.state,
            city: hotel.city,
            address: hotel.address,
            geoLocation: hotel.geoLocation,
            isBlocked: hotel.isBlocked,
            images: signedImageUrls,
            createdAt: hotel.createdAt,
            updatedAt: hotel.updatedAt,
        };

        return { hotel: mapHotel, message: "Hotel fetched successfully" };
    }
}


@injectable()
export class GetAllHotelsUseCase implements IGetAllHotelsUseCase {
    constructor(
        @inject(TOKENS.HotelRepository) private _hotelRepo: IHotelRepository,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service
    ) { }

    async execute(page: number = 1, limit: number = 10, search?: string): Promise<{ hotels: ResponseHotelDTO[]; total: number; message: string; }> {
        const { hotels, total } = await this._hotelRepo.findAllHotels(page, limit, search);

        if (!hotels || hotels.length === 0) {
            return { hotels: [], total: 0, message: "No hotels found" };
        }

        const mappedHotels = await Promise.all(
            hotels.map(async (hotel) => {
                let signedImageUrls = await this._redisService.getHotelImageUrls(hotel._id as string);

                if (!signedImageUrls) {
                    signedImageUrls = await Promise.all(
                        hotel.images.map((key: string) =>
                            this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt)
                        )
                    );
                    await this._redisService.storeHotelImageUrls(hotel._id as string, signedImageUrls, awsS3Timer.expiresAt);
                }

                const mapped: ResponseHotelDTO = {
                    id: hotel._id as string,
                    vendorId: hotel.vendorId.toString(),
                    name: hotel.name,
                    description: hotel.description,
                    rating: hotel.rating,
                    services: hotel.services,
                    amenities: hotel.amenities,
                    tags: hotel.tags,
                    state: hotel.state,
                    city: hotel.city,
                    address: hotel.address,
                    geoLocation: hotel.geoLocation,
                    isBlocked: hotel.isBlocked,
                    images: signedImageUrls,
                    createdAt: hotel.createdAt,
                    updatedAt: hotel.updatedAt,
                };

                return mapped;
            })
        );

        return {
            hotels: mappedHotels,
            total,
            message: "Hotels fetched successfully",
        };
    }
}

