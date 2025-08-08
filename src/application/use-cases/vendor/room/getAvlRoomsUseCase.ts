import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { TResponseRoomData } from "../../../../domain/interfaces/model/room.interface";
import { IRoomRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { IGetAvailableRoomsUseCase } from "../../../../domain/interfaces/model/room.interface";
import { awsS3Timer } from "../../../../infrastructure/config/jwtConfig";
import { RoomLookupBase } from "../../base/room.base";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";
import { ResponseMapper } from "../../../../utils/responseMapper";

@injectable()
export class GetAvailableRoomsUseCase extends RoomLookupBase implements IGetAvailableRoomsUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) roomRepo: IRoomRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
    ) {
        super(roomRepo);
    }

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
    ): Promise<{ rooms: TResponseRoomData[], total: number, message: string }> {

        const { rooms, total } = await this.getFilteredAvailableRoomsOrThrow(
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

        if (!Array.isArray(rooms)) {
            throw new AppError(`Expected 'rooms' to be an array but got: ${typeof rooms}`, HttpStatusCode.CONFLICT);
        }

        const availableRooms = rooms.filter(r => r.isAvailable);
        if (!Array.isArray(availableRooms)) {
            throw new AppError("Expected 'availableRooms' to be an array", HttpStatusCode.CONFLICT);
        }

        console.log('rooms: ', rooms);

        const mappedRooms = await Promise.all(
            availableRooms.map(async (roomEntity) => {
                const roomId = roomEntity.id!;
                const originalImageKeys = roomEntity.images;

                if (!Array.isArray(originalImageKeys)) {
                    throw new AppError(`Room ${roomId} has invalid images: ${originalImageKeys}`, HttpStatusCode.CONFLICT);
                }

                let signedImageUrls = await this._redisService.getRoomImageUrls(roomId);

                if (!signedImageUrls) {
                    signedImageUrls = await Promise.all(
                        originalImageKeys.map((imgKey) =>
                            this._awsS3Service.getFileUrlFromAws(imgKey, awsS3Timer.expiresAt)
                        )
                    );
                    await this._redisService.storeRoomImageUrls(roomId, signedImageUrls, awsS3Timer.expiresAt);
                }

                return {
                    ...roomEntity.toObject(),
                    images: signedImageUrls,
                };
            })
        );

        const finalMappedRooms = mappedRooms.map(ResponseMapper.mapRoomToResponseDTO);

        return {
            rooms: finalMappedRooms,
            total: total,
            message: 'Available rooms fetched successfully',
        };
    }
}
