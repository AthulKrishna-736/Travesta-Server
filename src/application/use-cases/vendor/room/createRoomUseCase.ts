import { injectable, inject } from "tsyringe";
import path from "path";
import fs from "fs/promises";
import { IRoomRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { TOKENS } from "../../../../constants/token";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";
import { TCreateRoomData, TResponseRoomData } from "../../../../domain/interfaces/model/hotel.interface";
import { ICreateRoomUseCase } from "../../../../domain/interfaces/model/usecases.interface";

@injectable()
export class CreateRoomUseCase implements ICreateRoomUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) protected _roomRepo: IRoomRepository,
        @inject(TOKENS.AwsS3Service) protected _awsS3Service: IAwsS3Service,
    ) { }

    protected async uploadRoomImages(files: Express.Multer.File[], hotelId: string | undefined): Promise<string[]> {
        if (!hotelId) {
            throw new AppError("Missing hotel ID for image upload", HttpStatusCode.BAD_REQUEST);
        }

        const uploadedImageKeys: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext = path.extname(file.originalname);
            const s3Key = `rooms/${hotelId}_${Date.now()}_${i}${ext}`;

            try {
                await this._awsS3Service.uploadFileToAws(s3Key, file.path);
                uploadedImageKeys.push(s3Key);
            } catch (error) {
                throw new AppError("Error uploading room images", HttpStatusCode.INTERNAL_SERVER_ERROR);
            } finally {
                try {
                    await fs.unlink(file.path);
                } catch (err) {
                    console.error(`Failed to delete temp file ${file.path}:`, err);
                }
            }
        }

        return uploadedImageKeys;
    }

    async createRoom(roomData: TCreateRoomData, files?: Express.Multer.File[]): Promise<{ room: TResponseRoomData; message: string }> {
        const { hotelId } = roomData;

        if (!hotelId) {
            throw new AppError("Hotel ID is required to create a room", HttpStatusCode.BAD_REQUEST);
        }

        let images: string[] = [];

        if (files && files.length > 0) {
            images = await this.uploadRoomImages(files, hotelId as string);
        }

        const roomToCreate: TCreateRoomData = {
            ...roomData,
            images,
        } as TCreateRoomData;

        const newRoom = await this._roomRepo.createRoom(roomToCreate);

        if (!newRoom) {
            throw new AppError("Failed to create room", HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return {
            room: newRoom,
            message: "Room created successfully",
        };
    }
}
