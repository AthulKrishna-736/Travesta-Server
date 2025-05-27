import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { IRoom } from "../../../../domain/interfaces/model/hotel.interface";
import { IRoomRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { awsS3Timer } from "../../../../infrastructure/config/jwtConfig";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";

@injectable()
export class GetRoomsByHotelUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) private _roomRepo: IRoomRepository,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service
    ) { }

    private async _getSignedUrls(roomId: string, imageKeys: string[]): Promise<string[]> {
        const signedUrls: string[] = [];

        for (const imageKey of imageKeys) {
            const redisKey = `room:${roomId}:${imageKey}`;

            let signedUrl = await this._redisService.get<string>(redisKey); 

            if (!signedUrl) {
                signedUrl = await this._awsS3Service.getFileUrlFromAws(imageKey, awsS3Timer.expiresAt);

                if (signedUrl) {
                    await this._redisService.set(redisKey, signedUrl, awsS3Timer.expiresAt); 
                }
            }

            if (signedUrl) {
                signedUrls.push(signedUrl);
            }
        }

        return signedUrls;
    }

    async getRoomsByHotel(hotelId: string): Promise<IRoom[]> {
        if (!hotelId) {
            throw new AppError("Hotel ID is required", HttpStatusCode.BAD_REQUEST);
        }

        const rooms = await this._roomRepo.findRoomsByHotel(hotelId);

        if (!rooms || rooms.length === 0) {
            return [];
        }

        for (const room of rooms) {
            if (room.images?.length) {
                const roomId = room._id?.toString() || '';
                room.images = await this._getSignedUrls(roomId, room.images);
            }
        }

        return rooms;
    }
}
