import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { TResponseRoomData } from "../../../../domain/interfaces/model/room.interface";
import { IRoomRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { IGetAvailableRoomsUseCase } from "../../../../domain/interfaces/model/room.interface";
import { awsS3Timer } from "../../../../infrastructure/config/jwtConfig";
import { RoomLookupBase } from "../../base/room.base";

@injectable()
export class GetAvailableRoomsUseCase extends RoomLookupBase implements IGetAvailableRoomsUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) roomRepo: IRoomRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
    ) {
        super(roomRepo);
    }

    async getAvlRooms(page: number, limit: number, search?: string): Promise<{ rooms: TResponseRoomData[], total: number, message: string }> {
        const { rooms, total } = await this.getAllRoomsOrThrow(page, limit, search);

        const availableRooms = rooms.filter(r => r.isAvailable);

        const mappedRooms = await Promise.all(
            availableRooms.map(async (roomEntity) => {
                const roomId = roomEntity.id!;
                const originalImageKeys = roomEntity.images;

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

        return {
            rooms: mappedRooms,
            total: mappedRooms.length,
            message: 'Available rooms fetched successfully',
        };
    }
}
