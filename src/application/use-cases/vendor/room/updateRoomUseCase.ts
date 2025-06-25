import { inject, injectable } from "tsyringe";
import { IRoomRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";
import { TOKENS } from "../../../../constants/token";
import { TUpdateRoomData, TResponseRoomData, IUpdateRoomUseCase } from "../../../../domain/interfaces/model/room.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";
import { AwsImageUploader } from "../../base/imageUploader";
import { RoomLookupBase } from "../../base/room.base";

@injectable()
export class UpdateRoomUseCase extends RoomLookupBase implements IUpdateRoomUseCase {
    private _imageUploader: AwsImageUploader;

    constructor(
        @inject(TOKENS.RoomRepository) roomRepo: IRoomRepository,
        @inject(TOKENS.AwsS3Service) awsS3Service: IAwsS3Service,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
    ) {
        super(roomRepo);
        this._imageUploader = new AwsImageUploader(awsS3Service);
    }

    async updateRoom(roomId: string, updateData: TUpdateRoomData, files?: Express.Multer.File[]): Promise<{ room: TResponseRoomData, message: string }> {
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

        const updatedRoom = await this._roomRepo.updateRoom(roomId, roomEntity.getPersistableData());

        if (!updatedRoom) {
            throw new AppError("Failed to update room", HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return {
            room: updatedRoom,
            message: "Room updated successfully",
        };
    }
}
