import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { IRoomRepository } from "../../../../domain/interfaces/repositories/roomRepo.interface";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { awsS3Timer } from "../../../../infrastructure/config/jwtConfig";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { IGetRoomsByHotelUseCase } from "../../../../domain/interfaces/model/room.interface";
import { RoomLookupBase } from "../../base/room.base";
import { ResponseMapper } from "../../../../utils/responseMapper";
import { HOTEL_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { TResponseRoomDTO } from "../../../../interfaceAdapters/dtos/room.dto";
import { IBookingRepository } from "../../../../domain/interfaces/repositories/bookingRepo.interface";

@injectable()
export class GetRoomsByHotelUseCase extends RoomLookupBase implements IGetRoomsByHotelUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) _roomRepository: IRoomRepository,
        @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service
    ) {
        super(_roomRepository);
    }

    private calculateDynamicPrice(basePrice: number, totalRooms: number, bookedRooms: number): number {
        const occupancy = bookedRooms / totalRooms;
        console.log('occuppancy ', occupancy, bookedRooms, totalRooms, basePrice);

        if (occupancy >= 0.7) {
            return Math.round(basePrice * 1.3);
        } else if (occupancy >= 0.4) {
            return Math.round(basePrice * 1.15);
        }
        return basePrice;
    }


    async getRoomsByHotel(hotelId: string, checkIn: string, checkOut: string): Promise<TResponseRoomDTO[]> {
        if (!hotelId) {
            throw new AppError(HOTEL_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
        }

        const roomEntities = await this.getRoomsEntityByHotelId(hotelId);

        const roomsWithSignedImages = await Promise.all(
            roomEntities.map(async (roomEntity) => {
                const roomIdStr = roomEntity.id!;
                const roomImages = roomEntity.images;

                const isAvailable = await this._bookingRepository.isRoomAvailable(roomIdStr, new Date(checkIn), new Date(checkOut));

                if (!isAvailable) {
                    return null;
                }

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

                const bookedRooms = await this._bookingRepository.getBookedRoomsCount(roomIdStr, checkIn, checkOut);

                const dynamicPrice = this.calculateDynamicPrice(
                    roomEntity.basePrice,
                    roomEntity.roomCount,
                    bookedRooms
                );

                const finalRoomObj = {
                    ...roomEntity.toObject(),
                    basePrice: dynamicPrice,
                    images: signedRoomUrls,
                    hotelId: hotelWithSignedImages,
                };

                return finalRoomObj;
            })
        );

        const availableRooms = roomsWithSignedImages.filter(
            (r): r is NonNullable<typeof r> => r !== null
        );

        const mappedRooms = availableRooms.map(r => ResponseMapper.mapRoomToResponseDTO(r));

        return mappedRooms;
    }
}
