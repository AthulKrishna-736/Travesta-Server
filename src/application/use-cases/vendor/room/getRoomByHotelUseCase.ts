import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { IRoomRepository } from "../../../../domain/interfaces/repositories/roomRepo.interface";
import { IRedisService } from "../../../../domain/interfaces/services/redisService.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { awsS3Timer } from "../../../../infrastructure/config/jwtConfig";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { IGetRoomsByHotelUseCase } from "../../../../domain/interfaces/model/room.interface";
import { ResponseMapper } from "../../../../utils/responseMapper";
import { HOTEL_ERROR_MESSAGES, ROOM_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { TResponseRoomDTO } from "../../../../interfaceAdapters/dtos/room.dto";
import { IBookingRepository } from "../../../../domain/interfaces/repositories/bookingRepo.interface";

@injectable()
export class GetRoomsByHotelUseCase implements IGetRoomsByHotelUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) private _roomRepository: IRoomRepository,
        @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service
    ) { }

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

        const rooms = await this._roomRepository.findRoomsByHotel(hotelId);

        if (!rooms || rooms.length === 0) {
            throw new AppError(ROOM_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const roomsWithSignedImages = await Promise.all(
            rooms.map(async (r) => {
                const isAvailable = await this._bookingRepository.isRoomAvailable(r._id as string, new Date(checkIn), new Date(checkOut));

                if (!isAvailable) {
                    return null;
                }

                if (!r.images || r.images.length <= 0) {
                    throw new AppError(ROOM_ERROR_MESSAGES.noImagesfound, HttpStatusCode.NOT_FOUND);
                }
                const signedRoomImages = await Promise.all(r.images.map(key => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt)));

                const hotel = r.hotelId as any;

                if (!hotel) {
                    throw new AppError(HOTEL_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
                }

                if (!hotel.images || hotel.images.length <= 0) {
                    throw new AppError(HOTEL_ERROR_MESSAGES.noImagesfound, HttpStatusCode.NOT_FOUND);
                }

                const signedHotelImages = await Promise.all(hotel.images.map((key: string) => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt)));
                const mappedHotel = {
                    ...hotel,
                    images: signedHotelImages,
                };

                const bookedRooms = await this._bookingRepository.getBookedRoomsCount(r._id as string, checkIn, checkOut);
                const dynamicPrice = this.calculateDynamicPrice(r.basePrice, r.roomCount, bookedRooms);

                const finalRoomObj = {
                    ...r,
                    basePrice: dynamicPrice,
                    images: signedRoomImages,
                    hotelId: mappedHotel,
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
