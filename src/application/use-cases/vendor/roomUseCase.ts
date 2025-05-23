import { injectable, inject } from "tsyringe";
import path from "path";
import fs from "fs";
import { IRoomRepository } from "../../../domain/repositories/repository.interface";
import { CreateRoomDTO, UpdateRoomDTO } from "../../../interfaces/dtos/hotel.dto";
import { IRoom } from "../../../domain/interfaces/hotel.interface";
import { TOKENS } from "../../../constants/token";
import { IAwsS3Service } from "../../../domain/services/awsS3Service.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";

@injectable()
export class CreateRoomUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) private _roomRepo: IRoomRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) { }

    async execute(roomData: CreateRoomDTO, files?: Express.Multer.File[]): Promise<{ room: IRoom; message: string }> {

        const uploadedImageKeys: string[] = [];

        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const ext = path.extname(file.originalname);
                const s3Key = `rooms/${roomData.hotelId}_${Date.now()}_${i}${ext}`;

                try {
                    await this._awsS3Service.uploadFileToAws(s3Key, file.path);
                    uploadedImageKeys.push(s3Key);
                } catch (error) {
                    throw new AppError("Error uploading room images", HttpStatusCode.INTERNAL_SERVER_ERROR);
                } finally {
                    fs.unlink(file.path, err => {
                        if (err) console.error(`Failed to delete temp file ${file.path}`, err);
                    });
                }
            }
        }

        // Create new room with uploaded image keys
        const newRoom = await this._roomRepo.createRoom({
            ...roomData,
            images: uploadedImageKeys,
            isAvailable: roomData.isAvailable ?? true,
        });

        if (!newRoom) {
            throw new AppError("Failed to create room", HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return {
            room: newRoom,
            message: "Room created successfully",
        };
    }
}


@injectable()
export class UpdateRoomUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) private _roomRepo: IRoomRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) { }

    async execute(roomId: string, updateData: UpdateRoomDTO, files?: Express.Multer.File[]): Promise<{ room: IRoom; message: string }> {
        const room = await this._roomRepo.findRoomById(roomId);

        if (!room) {
            throw new AppError("Room not found", HttpStatusCode.NOT_FOUND);
        }

        let uploadedImageKeys: string[] = room.images ?? [];

        // If new files uploaded, delete old images from S3 and upload new ones
        if (files && files.length > 0) {
            for (const key of uploadedImageKeys) {
                try {
                    await this._awsS3Service.deleteFileFromAws(key);
                } catch (err) {
                    console.error(`Failed to delete old image ${key} from S3`, err);
                }
            }

            uploadedImageKeys = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const ext = path.extname(file.originalname);
                const s3Key = `rooms/${room.hotelId}_${Date.now()}_${i}${ext}`;

                try {
                    await this._awsS3Service.uploadFileToAws(s3Key, file.path);
                    uploadedImageKeys.push(s3Key);
                } catch (err) {
                    throw new AppError("Error uploading room images", HttpStatusCode.INTERNAL_SERVER_ERROR);
                } finally {
                    fs.unlink(file.path, err => {
                        if (err) console.error(`Failed to delete temp file ${file.path}`, err);
                    });
                }
            }
        }

        // Update room data with new images
        const updatedRoom = await this._roomRepo.updateRoom(roomId, {
            ...updateData,
            images: uploadedImageKeys,
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
