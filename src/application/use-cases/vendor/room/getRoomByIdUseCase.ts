import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { IRoomRepository } from "../../../../domain/interfaces/repositories/roomRepo.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { awsS3Timer } from "../../../../infrastructure/config/jwtConfig";
import { IGetRoomByIdUseCase } from "../../../../domain/interfaces/model/room.interface";
import { ResponseMapper } from "../../../../utils/responseMapper";
import { TResponseRoomDTO } from "../../../../interfaceAdapters/dtos/room.dto";
import { AppError } from "../../../../utils/appError";
import { ROOM_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";

@injectable()
export class GetRoomByIdUseCase implements IGetRoomByIdUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) private _roomRepository: IRoomRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service
    ) { }

    async getRoomById(roomId: string): Promise<TResponseRoomDTO> {
        const room = await this._roomRepository.findRoomById(roomId);

        if (!room) {
            throw new AppError(ROOM_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        if (!room.images || room.images.length <= 0) {
            throw new AppError(ROOM_ERROR_MESSAGES.noImagesfound, HttpStatusCode.NOT_FOUND);
        }
        const signedRoomImages = await Promise.all(room.images.map(key => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt)));

        const roomWithSignedImages = {
            ...room,
            images: signedRoomImages,
        };

        return ResponseMapper.mapRoomToResponseDTO(roomWithSignedImages);
    }
}
