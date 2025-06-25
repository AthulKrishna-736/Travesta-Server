import { inject, injectable } from "tsyringe";
import { IRoomRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { TOKENS } from "../../../../constants/token";
import { IUpdateRoomUseCase } from "../../../../domain/interfaces/model/room.interface";
import { TResponseRoomData, TUpdateRoomData } from "../../../../domain/interfaces/model/room.interface";
import { CreateRoomUseCase } from "./createRoomUseCase";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";


@injectable()
export class UpdateRoomUseCase extends CreateRoomUseCase implements IUpdateRoomUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) roomRepo: IRoomRepository,
        @inject(TOKENS.AwsS3Service) awsS3Service: IAwsS3Service,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
    ) {
        super(roomRepo, awsS3Service);
    }

    async updateRoom(roomId: string, updateData: TUpdateRoomData, files?: Express.Multer.File[]): Promise<{ room: TResponseRoomData, message: string }> {
        const room = await this._roomRepo.findRoomById(roomId);
        if (!room) {
            throw new AppError("Room not found", HttpStatusCode.NOT_FOUND);
        }

        if (updateData.images) {
            const deleted = await this._imageUploader.deleteImagesFromAws(updateData.images, room.images);
            if (deleted) {
                await this._redisService.del(`roomImages:${roomId}`);
            }
        }

        let uploadedImageKeys: string[] = [];

        if (files && files.length > 0) {
            uploadedImageKeys = await this.uploadRoomImages(room.hotelId as string, files);
        }

        let keptImages: string[] = [];
        if (updateData.images) {
            const images = Array.isArray(updateData.images) ? updateData.images : [updateData.images];
            keptImages = images.map((i) => decodeURIComponent(new URL(i).pathname).slice(1));
        }

        const finalImages = [...keptImages, ...uploadedImageKeys]
        const updatedRoom = await this._roomRepo.updateRoom(roomId, {
            ...updateData,
            images: finalImages,
        });

        if (!updatedRoom) {
            throw new AppError("Failed to update room", HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return {
            room: updatedRoom,
            message: "Room updated successfully",
        };
    }
}
