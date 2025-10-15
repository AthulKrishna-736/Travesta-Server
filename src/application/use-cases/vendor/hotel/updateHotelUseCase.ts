import { inject, injectable } from "tsyringe";
import { IHotelRepository } from "../../../../domain/interfaces/repositories/hotelRepo.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { TOKENS } from "../../../../constants/token";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { IUpdateHotelUseCase } from "../../../../domain/interfaces/model/hotel.interface";
import { AwsImageUploader } from "../../base/imageUploader";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";
import { ResponseMapper } from "../../../../utils/responseMapper";
import { HOTEL_RES_MESSAGES } from "../../../../constants/resMessages";
import { HOTEL_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { TResponseHotelDTO, TUpdateHotelDTO } from "../../../../interfaceAdapters/dtos/hotel.dto";


@injectable()
export class UpdateHotelUseCase implements IUpdateHotelUseCase {
    private _imageUploader;
    constructor(
        @inject(TOKENS.HotelRepository) private _hotelRepository: IHotelRepository,
        @inject(TOKENS.AwsS3Service) _awsS3Service: IAwsS3Service,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
    ) {
        this._imageUploader = new AwsImageUploader(_awsS3Service)
    }

    async updateHotel(hotelId: string, updateData: TUpdateHotelDTO, files?: Express.Multer.File[]): Promise<{ hotel: TResponseHotelDTO; message: string }> {
        const hotel = await this._hotelRepository.findHotelById(hotelId);;

        if (!hotel) {
            throw new AppError(HOTEL_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        if (updateData.name && updateData.name !== hotel.name) {
            const isDuplicate = await this._hotelRepository.findDuplicateHotels(updateData.name.trim());
            if (isDuplicate) {
                throw new AppError(HOTEL_ERROR_MESSAGES.nameError, HttpStatusCode.BAD_REQUEST);
            }
        }

        if (updateData.images) {
            await this._imageUploader.deleteImagesFromAws(updateData.images, hotel.images)
        }

        let uploadedImageKeys: string[] = [];

        if (files && files.length > 0) {
            uploadedImageKeys = await this._imageUploader.uploadHotelImages(hotel.vendorId as string, files);
        }

        let keptImages: string[] = [];

        if (updateData.images) {
            const images = Array.isArray(updateData.images) ? updateData.images : [updateData.images];
            keptImages = images.map((i) => decodeURIComponent(new URL(i).pathname).slice(1));
        }

        const finalImages = [...keptImages, ...uploadedImageKeys]

        const finalUpdateData = {
            ...updateData,
            images: finalImages,
        }

        const updatedHotel = await this._hotelRepository.updateHotel(hotelId, finalUpdateData);

        if (!updatedHotel) {
            throw new AppError(HOTEL_ERROR_MESSAGES.updateFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const customHotelMapping = ResponseMapper.mapHotelToResponseDTO(updatedHotel);

        return {
            hotel: customHotelMapping,
            message: HOTEL_RES_MESSAGES.update,
        };
    }

}