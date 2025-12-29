import { inject, injectable } from "tsyringe";
import { IHotelRepository } from "../../../../domain/interfaces/repositories/hotelRepo.interface";
import { TOKENS } from "../../../../constants/token";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { IUpdateHotelUseCase, TUpdateHotelData } from "../../../../domain/interfaces/model/hotel.interface";
import { ResponseMapper } from "../../../../utils/responseMapper";
import { HOTEL_RES_MESSAGES } from "../../../../constants/resMessages";
import { HOTEL_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { TResponseHotelDTO, TUpdateHotelDTO } from "../../../../interfaceAdapters/dtos/hotel.dto";
import { IAwsImageUploader } from "../../../../domain/interfaces/model/admin.interface";


@injectable()
export class UpdateHotelUseCase implements IUpdateHotelUseCase {
    constructor(
        @inject(TOKENS.HotelRepository) private _hotelRepository: IHotelRepository,
        @inject(TOKENS.AwsImageUploader) private _awsImageUploader: IAwsImageUploader,
    ) { }

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
            await this._awsImageUploader.deleteImagesFromAws(updateData.images, hotel.images)
        }

        let uploadedImageKeys: string[] = [];

        if (files && files.length > 0) {
            uploadedImageKeys = await this._awsImageUploader.uploadHotelImages(hotel.vendorId as string, files);
        }

        let keptImages: string[] = [];

        if (updateData.images) {
            const images = Array.isArray(updateData.images) ? updateData.images : [updateData.images];
            keptImages = images.map((i) => decodeURIComponent(new URL(i).pathname).slice(1));
        }

        const finalImages = [...keptImages, ...uploadedImageKeys];

        const finalUpdateData: TUpdateHotelData = {
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