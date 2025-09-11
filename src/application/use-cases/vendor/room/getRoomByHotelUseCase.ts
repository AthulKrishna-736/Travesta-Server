import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { TResponseRoomData } from "../../../../domain/interfaces/model/room.interface";
import { IRoomRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { awsS3Timer } from "../../../../infrastructure/config/jwtConfig";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { IGetRoomsByHotelUseCase } from "../../../../domain/interfaces/model/room.interface";
import { RoomLookupBase } from "../../base/room.base";
import { ResponseMapper } from "../../../../utils/responseMapper";

@injectable()
export class GetRoomsByHotelUseCase extends RoomLookupBase implements IGetRoomsByHotelUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) _roomRepository: IRoomRepository,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service
    ) {
        super(_roomRepository);
    }

    async getRoomsByHotel(hotelId: string): Promise<TResponseRoomData[]> {
        if (!hotelId) {
            throw new AppError("Hotel ID is required", HttpStatusCode.BAD_REQUEST);
        }

        const roomEntities = await this.getRoomsEntityByHotelId(hotelId);

        const roomsWithSignedImages = await Promise.all(
            roomEntities.map(async (roomEntity) => {
                const roomIdStr = roomEntity.id!;
                const roomImages = roomEntity.images;

                let signedRoomUrls = await this._redisService.getRoomImageUrls(roomIdStr);
                if (!signedRoomUrls) {
                    signedRoomUrls = await Promise.all(
                        roomImages.map((key) =>
                            this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt)
                        )
                    );
                    await this._redisService.storeRoomImageUrls(roomIdStr, signedRoomUrls, awsS3Timer.expiresAt);
                }

                const hotelObj = roomEntity.hotelId as any;
                const hotelIdStr = hotelObj._id?.toString();

                let signedHotelUrls = await this._redisService.getHotelImageUrls(hotelIdStr);
                if (!signedHotelUrls) {
                    signedHotelUrls = await Promise.all(
                        (hotelObj.images || []).map((key: string) =>
                            this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt)
                        )
                    );
                    await this._redisService.storeHotelImageUrls(hotelIdStr, signedHotelUrls, awsS3Timer.expiresAt);
                }

                const hotelWithSignedImages = {
                    ...hotelObj,
                    images: signedHotelUrls,
                };

                const finalRoomObj = {
                    ...roomEntity.toObject(),
                    images: signedRoomUrls,
                    hotelId: hotelWithSignedImages,
                };

                return finalRoomObj;
            })
        );

        return roomsWithSignedImages;
    }
}
