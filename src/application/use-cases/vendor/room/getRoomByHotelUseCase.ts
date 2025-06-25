import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { TResponseRoomData } from "../../../../domain/interfaces/model/room.interface";
import { IRoomRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { awsS3Timer } from "../../../../infrastructure/config/jwtConfig";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";
import { IGetRoomsByHotelUseCase } from "../../../../domain/interfaces/model/room.interface";
import { RoomLookupBase } from "../../base/room.base";

@injectable()
export class GetRoomsByHotelUseCase extends RoomLookupBase implements IGetRoomsByHotelUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) roomRepo: IRoomRepository,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service
    ) {
        super(roomRepo);
    }

    async getRoomsByHotel(hotelId: string): Promise<TResponseRoomData[]> {
        if (!hotelId) {
            throw new AppError("Hotel ID is required", HttpStatusCode.BAD_REQUEST);
        }

        const roomEntities = await this.getRoomsEntityByHotelId(hotelId);

        const roomsWithSignedImages = await Promise.all(
            roomEntities.map(async (roomEntity) => {
                const roomId = roomEntity.id!;
                const imageKeys = roomEntity.images;

                let signedUrls = await this._redisService.getRoomImageUrls(roomId);

                if (!signedUrls) {
                    signedUrls = await Promise.all(
                        imageKeys.map((key) =>
                            this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt)
                        )
                    );
                    await this._redisService.storeRoomImageUrls(roomId, signedUrls, awsS3Timer.expiresAt);
                }

                return {
                    ...roomEntity.toObject(),
                    images: signedUrls
                };
            })
        );

        return roomsWithSignedImages;
    }
}
