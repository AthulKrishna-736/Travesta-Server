import { inject, injectable } from 'tsyringe';
import { IAwsS3Service } from '../../../../domain/interfaces/services/awsS3Service.interface';
import { TOKENS } from '../../../../constants/token';
import { awsS3Timer } from '../../../../infrastructure/config/jwtConfig';
import { IGetAllRoomsUseCase } from '../../../../domain/interfaces/model/room.interface';
import { IRoomRepository } from '../../../../domain/interfaces/repositories/roomRepo.interface';
import { ResponseMapper } from '../../../../utils/responseMapper';
import { ROOM_RES_MESSAGES } from '../../../../constants/resMessages';
import { TResponseRoomDTO } from '../../../../interfaceAdapters/dtos/room.dto';
import { AppError } from '../../../../utils/appError';
import { ROOM_ERROR_MESSAGES } from '../../../../constants/errorMessages';
import { HttpStatusCode } from '../../../../constants/HttpStatusCodes';

@injectable()
export class GetAllRoomsUseCase implements IGetAllRoomsUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) private _roomRepository: IRoomRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) { }

    async getAllRooms(vendorId: string, page: number, limit: number, search?: string, hotelId?: string): Promise<{ rooms: TResponseRoomDTO[]; message: string; total: number }> {
        const { rooms, total } = await this._roomRepository.findAllRooms(vendorId, page, limit, search, hotelId);

        const mappedRooms = await Promise.all(
            rooms.map(async (r) => {
                if (!r.images || r.images.length == 0) {
                    throw new AppError(ROOM_ERROR_MESSAGES.noImagesfound, HttpStatusCode.NOT_FOUND);
                }
                const signedRoomImages = await Promise.all(r.images.map((key) => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt)));

                return {
                    ...r,
                    images: signedRoomImages,
                };
            })
        );

        const finalMappedRooms = mappedRooms.map(ResponseMapper.mapRoomToResponseDTO);

        return {
            rooms: finalMappedRooms,
            message: ROOM_RES_MESSAGES.getAll,
            total,
        };
    }
}
