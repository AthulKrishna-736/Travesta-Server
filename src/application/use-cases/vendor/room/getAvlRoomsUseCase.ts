import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { TResponseRoomData } from "../../../../domain/interfaces/model/hotel.interface";
import { IRoomRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { GetRoomsByHotelUseCase } from "./getRoomByHotelUseCase";
import { IGetAvailableRoomsByHotelUseCase } from "../../../../domain/interfaces/model/usecases.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";

@injectable()
export class GetAvailableRoomsByHotelUseCase extends GetRoomsByHotelUseCase implements IGetAvailableRoomsByHotelUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) roomRepo: IRoomRepository,
        @inject(TOKENS.RedisService) redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) awsS3Service: IAwsS3Service,
    ) {
        super(roomRepo, redisService, awsS3Service);
    }

    async getAvlRoomsByHotel(hotelId: string): Promise<TResponseRoomData[]> {
        if (!hotelId) {
            throw new AppError("Hotel ID is required", HttpStatusCode.BAD_REQUEST);
        }

        const availableRooms = await this._roomRepo.findAvailableRoomsByHotel(hotelId);
        if (!availableRooms || availableRooms.length === 0) {
            return [];
        }

        await Promise.all(
            availableRooms.map(async (room) => {
                if (room.images?.length) {
                    const roomId = room._id?.toString() || '';
                    room.images = await this._getSignedUrls(roomId, room.images);
                }
            })
        );

        return availableRooms;
    }
}
