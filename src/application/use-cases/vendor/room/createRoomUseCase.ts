import { inject, injectable } from 'tsyringe';
import { ICreateRoomUseCase } from '../../../../domain/interfaces/model/room.interface';
import { IRoomRepository } from '../../../../domain/interfaces/repositories/roomRepo.interface';
import { TOKENS } from '../../../../constants/token';
import { AppError } from '../../../../utils/appError';
import { HttpStatusCode } from '../../../../constants/HttpStatusCodes';
import { ResponseMapper } from '../../../../utils/responseMapper';
import { ROOM_RES_MESSAGES } from '../../../../constants/resMessages';
import { HOTEL_ERROR_MESSAGES, ROOM_ERROR_MESSAGES } from '../../../../constants/errorMessages';
import { TCreateRoomDTO, TResponseRoomDTO } from '../../../../interfaceAdapters/dtos/room.dto';
import { IAwsImageUploader } from '../../../../domain/interfaces/model/admin.interface';

@injectable()
export class CreateRoomUseCase implements ICreateRoomUseCase {

    constructor(
        @inject(TOKENS.RoomRepository) protected _roomRepository: IRoomRepository,
        @inject(TOKENS.AwsImageUploader) private _awsImageUploader: IAwsImageUploader,
    ) { }

    protected async uploadRoomImages(hotelId: string, files: Express.Multer.File[]): Promise<string[]> {
        return this._awsImageUploader.uploadRoomImages(hotelId, files);
    }

    async createRoom(roomData: TCreateRoomDTO, files: Express.Multer.File[]): Promise<{ room: TResponseRoomDTO, message: string }> {
        if (!roomData.hotelId) {
            throw new AppError(HOTEL_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
        }

        const isDuplicate = await this._roomRepository.findDuplicateRooms(roomData.name.trim(), roomData.hotelId.toString());
        if (isDuplicate) {
            throw new AppError(ROOM_ERROR_MESSAGES.nameError, HttpStatusCode.CONFLICT);
        }

        let uploadedImageKeys;

        if (files) {
            uploadedImageKeys = await this.uploadRoomImages(roomData.hotelId as string, files)
        }

        const newRoom = await this._roomRepository.createRoom({ ...roomData, images: uploadedImageKeys as string[] });

        if (!newRoom) {
            throw new AppError(ROOM_ERROR_MESSAGES.createFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const finalMappedRooms = ResponseMapper.mapRoomToResponseDTO(newRoom);

        return {
            room: finalMappedRooms,
            message: ROOM_RES_MESSAGES.create,
        };
    }
}

