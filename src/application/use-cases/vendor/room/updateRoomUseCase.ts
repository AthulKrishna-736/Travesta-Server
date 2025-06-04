import { inject, injectable } from "tsyringe";
import { IRoomRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { TOKENS } from "../../../../constants/token";
import { IUpdateRoomUseCase } from "../../../../domain/interfaces/model/usecases.interface";
import { TResponseRoomData, TUpdateRoomData } from "../../../../domain/interfaces/model/hotel.interface";
import { CreateRoomUseCase } from "./createRoomUseCase";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";


@injectable()
export class UpdateRoomUseCase extends CreateRoomUseCase implements IUpdateRoomUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) roomRepo: IRoomRepository,
        @inject(TOKENS.AwsS3Service) awsS3Service: IAwsS3Service,
    ) {
        super(roomRepo, awsS3Service);
    }

    async updateRoom(roomId: string, updateData: TUpdateRoomData, files?: Express.Multer.File[]) {
        const room = await this._roomRepo.findRoomById(roomId);
        if (!room) {
            throw new AppError("Room not found", HttpStatusCode.NOT_FOUND);
        }

        let currentImages: string[] = room.images ?? [];

        const imagesToKeep: string[] = updateData.images ?? currentImages;

        const imagesToDelete = currentImages.filter(img => !imagesToKeep.includes(img));

        if (imagesToDelete.length > 0) {
            await this._imageUploader.deleteImagesFromAws(imagesToDelete, currentImages);
        }

        let finalImages = [...imagesToKeep];

        if (files && files.length > 0) {
            const uploadedImages = await this.uploadRoomImages(room.hotelId as string, files);
            finalImages = finalImages.concat(uploadedImages);
        }

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
