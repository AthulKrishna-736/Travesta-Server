import { inject, injectable } from 'tsyringe';
import { IRoomRepository } from '../../../../domain/interfaces/repositories/repository.interface';
import { IAwsS3Service } from '../../../../domain/interfaces/services/awsS3Service.interface';
import { IRedisService } from '../../../../domain/interfaces/services/redisService.interface';
import { TOKENS } from '../../../../constants/token';
import { awsS3Timer } from '../../../../infrastructure/config/jwtConfig';
import { IGetAllRoomsUseCase } from '../../../../domain/interfaces/model/usecases.interface';
import { TResponseRoomData } from '../../../../domain/interfaces/model/hotel.interface';

@injectable()
export class GetAllRoomsUseCase implements IGetAllRoomsUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) private _roomRepo: IRoomRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
    ) { }

    async execute(): Promise<{ rooms: TResponseRoomData[]; message: string }> {
        const allRooms = await this._roomRepo.findAll();

        if (!allRooms || allRooms.length === 0) {
            return { rooms: [], message: 'No rooms found' };
        }

        const mappedRooms = await Promise.all(
            allRooms.map(async (room) => {
                let signedImageUrls = await this._redisService.getRoomImageUrls(room._id as string);

                if (!signedImageUrls) {
                    signedImageUrls = await Promise.all(
                        room.images.map((imgKey) =>
                            this._awsS3Service.getFileUrlFromAws(imgKey, awsS3Timer.expiresAt)
                        )
                    );
                    await this._redisService.storeRoomImageUrls(room._id as string, signedImageUrls, awsS3Timer.expiresAt);
                }

                return {
                    ...room,
                    images: signedImageUrls,
                };
            })
        );

        return {
            rooms: mappedRooms,
            message: 'Rooms fetched successfully',
        };
    }
}
