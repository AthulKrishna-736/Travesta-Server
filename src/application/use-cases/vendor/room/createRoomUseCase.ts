import { inject, injectable } from 'tsyringe';
import { ICreateRoomUseCase } from '../../../../domain/interfaces/model/room.interface';
import { IRoomRepository } from '../../../../domain/interfaces/repositories/repository.interface';
import { IAwsS3Service } from '../../../../domain/interfaces/services/awsS3Service.interface';
import { TOKENS } from '../../../../constants/token';
import { TCreateRoomData, TResponseRoomData } from '../../../../domain/interfaces/model/room.interface';
import { AppError } from '../../../../utils/appError';
import { HttpStatusCode } from '../../../../utils/HttpStatusCodes';
import { AwsImageUploader } from '../../base/imageUploader';

@injectable()
export class CreateRoomUseCase implements ICreateRoomUseCase {
    protected _imageUploader: AwsImageUploader;

    constructor(
        @inject(TOKENS.RoomRepository) protected _roomRepo: IRoomRepository,
        @inject(TOKENS.AwsS3Service) awsS3Service: IAwsS3Service,
    ) {
        this._imageUploader = new AwsImageUploader(awsS3Service);
    }

    protected async uploadRoomImages(hotelId: string, files: Express.Multer.File[]): Promise<string[]> {
        return this._imageUploader.uploadRoomImages(hotelId, files);
    }

    async createRoom(roomData: TCreateRoomData, files: Express.Multer.File[]): Promise<{ room: TResponseRoomData, message: string }> {
        if (!roomData.hotelId) {
            throw new AppError("Hotel ID is required", HttpStatusCode.BAD_REQUEST);
        }

        let uploadedImageKeys;

        if (files) {
            uploadedImageKeys = await this.uploadRoomImages(roomData.hotelId as string, files)
        }

        const newRoom = await this._roomRepo.createRoom({ ...roomData, images: uploadedImageKeys as string[] });

        if (!newRoom) {
            throw new AppError("Failed to create room", HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return {
            room: newRoom,
            message: 'Room created successfully',
        };
    }
}

