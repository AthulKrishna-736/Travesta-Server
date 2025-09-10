import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { TResponseRoomData } from "../../../../domain/interfaces/model/room.interface";
import { IRoomRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { awsS3Timer } from "../../../../infrastructure/config/jwtConfig";
import { IGetRoomByIdUseCase } from "../../../../domain/interfaces/model/room.interface";
import { RoomLookupBase } from "../../base/room.base";
import { ResponseMapper } from "../../../../utils/responseMapper";

@injectable()
export class GetRoomByIdUseCase extends RoomLookupBase implements IGetRoomByIdUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) _roomRepository: IRoomRepository,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service
    ) {
        super(_roomRepository);
    }

    async getRoomById(roomId: string): Promise<TResponseRoomData> {
        const roomEntity = await this.getRoomEntityById(roomId);
        const roomIdStr = roomEntity.id!;
        const originalImages = roomEntity.images;

        let signedImageUrls = await this._redisService.getRoomImageUrls(roomIdStr);

        if (!signedImageUrls) {
            signedImageUrls = await Promise.all(
                originalImages.map((key) =>
                    this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt)
                )
            );
            await this._redisService.storeRoomImageUrls(roomIdStr, signedImageUrls, awsS3Timer.expiresAt);
        }

        const roomWithSignedImages = {
            ...roomEntity.toObject(),
            images: signedImageUrls,
        };
        return ResponseMapper.mapRoomToResponseDTO(roomWithSignedImages);
    }
}
