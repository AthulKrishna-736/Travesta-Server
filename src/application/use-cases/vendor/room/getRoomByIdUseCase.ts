import { inject, injectable } from "tsyringe";
import { GetRoomsByHotelUseCase } from "./getRoomByHotelUseCase";
import { TOKENS } from "../../../../constants/token";
import { IRoomRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { TResponseRoomData } from "../../../../domain/interfaces/model/room.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";
import { IGetRoomByIdUseCase } from "../../../../domain/interfaces/model/room.interface";


@injectable()
export class GetRoomByIdUseCase extends GetRoomsByHotelUseCase implements IGetRoomByIdUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) roomRepo: IRoomRepository,
        @inject(TOKENS.RedisService) redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) awsS3Service: IAwsS3Service,
    ) {
        super(roomRepo, redisService, awsS3Service);
    }

    async getRoomById(roomId: string): Promise<TResponseRoomData> {
        const room = await this._roomRepo.findRoomById(roomId);

        if (!room) {
            throw new AppError("Room not found", HttpStatusCode.NOT_FOUND);
        }

        if (room.images?.length) {
            const id = room._id?.toString() || '';
            room.images = await this._getSignedUrls(id, room.images);
        }

        return room;
    }
}
