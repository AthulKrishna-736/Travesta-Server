import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { TResponseRoomData } from "../../../../domain/interfaces/model/room.interface";
import { IRoomRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { IGetAvailableRoomsUseCase } from "../../../../domain/interfaces/model/room.interface";
import { GetAllRoomsUseCase } from "./getAllRoomsUseCase";

@injectable()
export class GetAvailableRoomsUseCase extends GetAllRoomsUseCase implements IGetAvailableRoomsUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) roomRepo: IRoomRepository,
        @inject(TOKENS.RedisService) redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) awsS3Service: IAwsS3Service,
    ) {
        super(roomRepo, awsS3Service, redisService);
    }

    async getAvlRooms(page: number, limit: number, search?: string): Promise<{ rooms: TResponseRoomData[], total: number, message: string }> {

        const { rooms, total, message } = await this.getAllRooms(page, limit, search);

        const mappedRooms = rooms.filter(r => r.isAvailable === true)

        return {
            rooms: mappedRooms,
            total,
            message
        };
    }
}
