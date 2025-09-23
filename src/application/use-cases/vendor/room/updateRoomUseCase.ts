import { inject, injectable } from "tsyringe";
import { IRoomRepository } from "../../../../domain/interfaces/repositories/roomRepo.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";
import { TOKENS } from "../../../../constants/token";
import { IUpdateRoomUseCase } from "../../../../domain/interfaces/model/room.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { AwsImageUploader } from "../../base/imageUploader";
import { RoomLookupBase } from "../../base/room.base";
import { ResponseMapper } from "../../../../utils/responseMapper";
import { ROOM_RES_MESSAGES } from "../../../../constants/resMessages";
import { ROOM_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { TResponseRoomDTO, TUpdateRoomDTO } from "../../../../interfaceAdapters/dtos/room.dto";

@injectable()
export class UpdateRoomUseCase extends RoomLookupBase implements IUpdateRoomUseCase {
    private _imageUploader: AwsImageUploader;

    constructor(
        @inject(TOKENS.RoomRepository) _roomRepository: IRoomRepository,
        @inject(TOKENS.AwsS3Service) awsS3Service: IAwsS3Service,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
    ) {
        super(_roomRepository);
        this._imageUploader = new AwsImageUploader(awsS3Service);
    }

    async updateRoom(roomId: string, updateData: TUpdateRoomDTO, files?: Express.Multer.File[]): Promise<{ room: TResponseRoomDTO, message: string }> {
        if (updateData.name) {
            const isDuplicate = await this._roomRepository.findDuplicateRooms(updateData.name.trim());
            if (isDuplicate) {
                throw new AppError(ROOM_ERROR_MESSAGES.nameError, HttpStatusCode.CONFLICT);
            }
        }

        const roomEntity = await this.getRoomEntityById(roomId);
        let deletedImages = false;

        if (updateData.images) {
            deletedImages = await this._imageUploader.deleteImagesFromAws(updateData.images, roomEntity.images);
            if (deletedImages) {
                await this._redisService.del(`roomImages:${roomId}`);
            }
        }

        let uploadedImageKeys: string[] = [];

        if (deletedImages && files && files.length > 0) {
            uploadedImageKeys = await this._imageUploader.uploadRoomImages(roomEntity.hotelId.toString(), files);
        }

        let keptImages: string[] = [];

        if (updateData.images) {
            const images = Array.isArray(updateData.images) ? updateData.images : [updateData.images];
            keptImages = images.map((i) => decodeURIComponent(new URL(i).pathname).slice(1));
        }

        const finalImages = [...keptImages, ...uploadedImageKeys];

        roomEntity.updateRoom({
            ...updateData,
            images: finalImages,
        });

        const updatedRoom = await this._roomRepository.updateRoom(roomId, roomEntity.getPersistableData());

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
