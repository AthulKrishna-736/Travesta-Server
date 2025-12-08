import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { IRoomRepository } from "../../../../domain/interfaces/repositories/roomRepo.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { awsS3Timer } from "../../../../infrastructure/config/jwtConfig";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { IGetRoomsByHotelUseCase } from "../../../../domain/interfaces/model/room.interface";
import { ResponseMapper } from "../../../../utils/responseMapper";
import { HOTEL_ERROR_MESSAGES, ROOM_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { TResponseRoomDTO } from "../../../../interfaceAdapters/dtos/room.dto";
import { IBookingRepository } from "../../../../domain/interfaces/repositories/bookingRepo.interface";
import { calculateDynamicPricing, calculateGSTPrice, getPropertyTime } from "../../../../utils/helperFunctions";
import { IHotelRepository } from "../../../../domain/interfaces/repositories/hotelRepo.interface";

@injectable()
export class GetRoomsByHotelUseCase implements IGetRoomsByHotelUseCase {
    constructor(
        @inject(TOKENS.HotelRepository) private _hotelRepository: IHotelRepository,
        @inject(TOKENS.RoomRepository) private _roomRepository: IRoomRepository,
        @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service
    ) { }

    async getRoomsByHotel(hotelId: string, checkIn: string, checkOut: string, roomCount: number, adults: number, children: number): Promise<TResponseRoomDTO[]> {
        const hotel = await this._hotelRepository.findHotelById(hotelId);
        if (!hotel) throw new AppError(HOTEL_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);

        const rooms = await this._roomRepository.findRoomsByHotel(hotelId);

        if (!rooms || rooms.length === 0) {
            throw new AppError(ROOM_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const roomsWithSignedImages = await Promise.all(
            rooms.map(async (r) => {
                const { checkInDate, checkOutDate } = getPropertyTime(checkIn, checkOut, hotel.propertyRules.checkInTime, hotel.propertyRules.checkOutTime);

                const isAvailable = await this._bookingRepository.isRoomAvailable(r._id!.toString(), roomCount, checkInDate, checkOutDate);
                if (!isAvailable) {
                    return null;
                }

                if (!r.images || r.images.length <= 0) throw new AppError(ROOM_ERROR_MESSAGES.noImagesfound, HttpStatusCode.NOT_FOUND);

                const signedRoomImages = await Promise.all(r.images.map(key => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt)));
                const bookedRooms = await this._bookingRepository.getBookedRoomsCount(r._id as string, checkInDate, checkOutDate);

                const dynamicPrice = calculateDynamicPricing(r.basePrice, r.roomCount, bookedRooms);
                const gstPrice = calculateGSTPrice(r.basePrice);
                const totalBasePrice = dynamicPrice * roomCount;
                const totalGstPrice = gstPrice * roomCount;

                return {
                    ...r,
                    basePrice: totalBasePrice,
                    gstPrice: totalGstPrice,
                    images: signedRoomImages,
                };
            })
        );

        const availableRooms = roomsWithSignedImages.filter(r => r !== null);
        const mappedRooms = availableRooms.map(r => ResponseMapper.mapRoomToResponseDTO(r));

        return mappedRooms;
    }
}
