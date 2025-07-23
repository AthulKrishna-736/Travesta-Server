import { inject, injectable } from 'tsyringe';
import { IAwsS3Service } from '../../../../domain/interfaces/services/awsS3Service.interface';
import { IRedisService } from '../../../../domain/interfaces/services/redisService.interface';
import { TOKENS } from '../../../../constants/token';
import { awsS3Timer } from '../../../../infrastructure/config/jwtConfig';
import { IGetAllRoomsUseCase, TResponseRoomData } from '../../../../domain/interfaces/model/room.interface';
import { IRoomRepository } from '../../../../domain/interfaces/repositories/repository.interface';
import { RoomLookupBase } from '../../base/room.base';
import { ResponseMapper } from '../../../../utils/responseMapper';

@injectable()
export class GetAllRoomsUseCase extends RoomLookupBase implements IGetAllRoomsUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) roomRepo: IRoomRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
    ) {
        super(roomRepo);
    }

    async getAllRooms(page: number, limit: number, search?: string): Promise<{ rooms: TResponseRoomData[]; message: string; total: number }> {
        const { rooms, total } = await this.getAllRoomsOrThrow(page, limit, search);

        const mappedRooms = await Promise.all(
            rooms.map(async (roomEntity) => {
                const roomId = roomEntity.id as string;
                const originalImageKeys = Array.isArray(roomEntity.images) ? roomEntity.images : [];

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
            message: 'Rooms fetched successfully',
            total,
        };
    }
}
