import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { IRoomRepository } from "../../../../domain/interfaces/repositories/roomRepo.interface";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { IGetAvailableRoomsUseCase } from "../../../../domain/interfaces/model/room.interface";
import { awsS3Timer } from "../../../../infrastructure/config/jwtConfig";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { ResponseMapper } from "../../../../utils/responseMapper";
import { ROOM_RES_MESSAGES } from "../../../../constants/resMessages";
import { TResponseRoomDTO } from "../../../../interfaceAdapters/dtos/room.dto";
import { ROOM_ERROR_MESSAGES } from "../../../../constants/errorMessages";

@injectable()
export class GetAvailableRoomsUseCase implements IGetAvailableRoomsUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) private _roomRepository: IRoomRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
    ) { }

    async getAvlRooms(
        page: number,
        limit: number,
        minPrice?: number,
        maxPrice?: number,
        amenities?: string[],
        search?: string,
        destination?: string,
        checkIn?: string,
        checkOut?: string,
        guests?: string
    ): Promise<{ rooms: TResponseRoomDTO[], total: number, message: string }> {

        const { rooms, total } = await this._roomRepository.findFilteredAvailableRooms(
            page,
            limit,
            minPrice,
            maxPrice,
            amenities,
            search,
            destination,
            checkIn,
            checkOut,
            guests
        );

        if (!rooms || rooms.length === 0) {
            throw new AppError(ROOM_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        if (!Array.isArray(rooms)) {
            throw new AppError(`Expected 'rooms' to be an array but got: ${typeof rooms}`, HttpStatusCode.CONFLICT);
        }

        const availableRooms = rooms.filter(r => r.isAvailable);
        if (!Array.isArray(availableRooms)) {
            throw new AppError("Expected 'availableRooms' to be an array", HttpStatusCode.CONFLICT);
        }

        const mappedRooms = await Promise.all(
            availableRooms.map(async (r) => {
                if (!r.images || r.images.length <= 0) {
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
            total: total,
            message: ROOM_RES_MESSAGES.getAvl,
        };
    }
}
