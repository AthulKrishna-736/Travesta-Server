import { inject, injectable } from "tsyringe";
import { IRoomRepository } from "../../../../domain/interfaces/repositories/roomRepo.interface";
import { TOKENS } from "../../../../constants/token";
import { IUpdateRoomUseCase } from "../../../../domain/interfaces/model/room.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { ResponseMapper } from "../../../../utils/responseMapper";
import { ROOM_RES_MESSAGES } from "../../../../constants/resMessages";
import { ROOM_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { TResponseRoomDTO, TUpdateRoomDTO } from "../../../../interfaceAdapters/dtos/room.dto";
import { IAwsImageUploader } from "../../../../domain/interfaces/model/admin.interface";

@injectable()
export class UpdateRoomUseCase implements IUpdateRoomUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) private _roomRepository: IRoomRepository,
        @inject(TOKENS.AwsImageUploader) private _awsImageUploader: IAwsImageUploader,
    ) { }

    async updateRoom(roomId: string, updateData: TUpdateRoomDTO, files?: Express.Multer.File[]): Promise<{ room: TResponseRoomDTO, message: string }> {
        const room = await this._roomRepository.findRoomById(roomId);

        if (!room) {
            throw new AppError(ROOM_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const activeHotelId =
            typeof updateData.hotelId === "string" && updateData.hotelId.trim() ? updateData.hotelId.trim() :
                (room.hotelId && typeof room.hotelId === "object" && "_id" in room.hotelId ? room.hotelId._id.toString() : room.hotelId?.toString());

        if (!activeHotelId) {
            throw new AppError("Hotel ID is missing or invalid", HttpStatusCode.BAD_REQUEST);
        }

        if (updateData.name && updateData.name.trim() !== room.name.trim()) {
            const isDuplicate = await this._roomRepository.findDuplicateRooms(updateData.name.trim(), activeHotelId);
            if (isDuplicate) {
                throw new AppError(ROOM_ERROR_MESSAGES.nameError, HttpStatusCode.CONFLICT);
            }
        }

        if (updateData.images) {
            await this._awsImageUploader.deleteImagesFromAws(updateData.images, room.images);
        }

        let uploadedImageKeys: string[] = [];

        if (files && files.length > 0) {
            uploadedImageKeys = await this._awsImageUploader.uploadRoomImages(activeHotelId, files);
        }

        let keptImages: string[] = [];

        if (updateData.images) {
            const images = Array.isArray(updateData.images) ? updateData.images : [updateData.images];
            keptImages = images.map((i) => decodeURIComponent(new URL(i).pathname).slice(1));
        }

        const finalImages = [...keptImages, ...uploadedImageKeys];

        const finalRoomData = {
            ...updateData,
            hotelId: activeHotelId,
            images: finalImages,
        }

        const updatedRoom = await this._roomRepository.updateRoom(roomId, finalRoomData);

        if (!updatedRoom) {
            throw new AppError(ROOM_ERROR_MESSAGES.updateFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const finalMappedRooms = ResponseMapper.mapRoomToResponseDTO(updatedRoom);

        return {
            room: finalMappedRooms,
            message: ROOM_RES_MESSAGES.update,
        };
    }
}
