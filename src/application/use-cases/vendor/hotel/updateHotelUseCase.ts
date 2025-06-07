import { inject, injectable } from "tsyringe";
import { IHotelRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { TOKENS } from "../../../../constants/token";
import { TUpdateHotelData, TResponseHotelData } from "../../../../domain/interfaces/model/hotel.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";
import { IUpdateHotelUseCase } from "../../../../domain/interfaces/model/usecases.interface";
import { HotelLookupBase } from "../../base/hotelLookup.base";
import { AwsImageUploader } from "../../base/imageUploader";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";


@injectable()
export class UpdateHotelUseCase extends HotelLookupBase implements IUpdateHotelUseCase {
    private _imageUploader;
    constructor(
        @inject(TOKENS.HotelRepository) hotelRepo: IHotelRepository,
        @inject(TOKENS.AwsS3Service) awsS3Service: IAwsS3Service,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
    ) {
        super(hotelRepo);
        this._imageUploader = new AwsImageUploader(awsS3Service)
    }

    async updateHotel(hotelId: string, updateData: TUpdateHotelData, files?: Express.Multer.File[]): Promise<{ hotel: TResponseHotelData; message: string }> {
        const hotel = await this.getHotelEntityById(hotelId)

        if (updateData.name && updateData.name !== hotel.name) {
            const vendorHotels = await this.getHotelEntityByVendorId(hotel.vendorId as string)

            if (vendorHotels && vendorHotels.some(h => h.name === updateData.name && h.id !== hotelId)) {
                throw new AppError("Hotel name already exists for this vendor", HttpStatusCode.BAD_REQUEST);
            }
        }

        let deletedImages;
        if (updateData.images) {
            deletedImages = await this._imageUploader.deleteImagesFromAws(updateData.images, hotel.images)
            if (deletedImages) {
                await this._redisService.del(`hotelImages:${hotelId}`);
            }
        }

        let uploadedImageKeys: string[] = [];

        if (deletedImages && files && files.length > 0) {
            uploadedImageKeys = await this._imageUploader.uploadHotelImages(hotel.vendorId as string, files);
        }

        let keptImages: string[] = [];

        if (updateData.images) {
            const images = Array.isArray(updateData.images) ? updateData.images : [updateData.images];
            keptImages = images.map((i) => decodeURIComponent(new URL(i).pathname).slice(1));

        }

        const finalImages = [...keptImages, ...uploadedImageKeys]

        hotel.updateHotel({
            ...updateData,
            images: finalImages
        })

        const updatedHotel = await this._hotelRepo.updateHotel(hotelId, hotel.getPersistableData());

        if (!updatedHotel) {
            throw new AppError("Failed to update hotel", HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return {
            hotel: updatedHotel,
            message: "Hotel updated successfully"
        };
    }

}