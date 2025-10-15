import { inject, injectable } from "tsyringe";
import { IAmenitiesRepository } from "../../../../domain/interfaces/repositories/amenitiesRepo.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { TOKENS } from "../../../../constants/token";
import { awsS3Timer } from "../../../../infrastructure/config/jwtConfig";
import { IGetAllHotelsUseCase } from "../../../../domain/interfaces/model/hotel.interface";
import { ResponseMapper } from "../../../../utils/responseMapper";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { HOTEL_RES_MESSAGES } from "../../../../constants/resMessages";
import { IHotelRepository } from "../../../../domain/interfaces/repositories/hotelRepo.interface";
import { HOTEL_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { TResponseHotelDTO } from "../../../../interfaceAdapters/dtos/hotel.dto";
import { IBookingRepository } from "../../../../domain/interfaces/repositories/bookingRepo.interface";


@injectable()
export class GetAllHotelsUseCase implements IGetAllHotelsUseCase {
    constructor(
        @inject(TOKENS.HotelRepository) private _hotelRepository: IHotelRepository,
        @inject(TOKENS.AmenitiesRepository) private _amenitiesRepository: IAmenitiesRepository,
        @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) { }

    private calculateDynamicPrice(basePrice: number, totalRooms: number, bookedRooms: number): number {
        const occupancy = bookedRooms / totalRooms;
        console.log('occuppancy ', occupancy, basePrice, totalRooms, bookedRooms);

        if (occupancy >= 0.7) {
            return Math.round(basePrice * 1.3);
        } else if (occupancy >= 0.4) {
            return Math.round(basePrice * 1.15);
        }
        return basePrice;
    }

    async getAllHotel(
        page: number,
        limit: number,
        filters: { search?: string; amenities?: string[]; roomType?: string[]; checkIn?: string; checkOut?: string; guests?: number; minPrice?: number; maxPrice?: number; sort?: string }
    ): Promise<{ hotels: TResponseHotelDTO[]; total: number; message: string }> {

        let hotelAmenities: string[] = [];
        let roomAmenities: string[] = [];

        if (filters.amenities && filters.amenities.length > 0) {
            const { hotelAmenities: hAmns, roomAmenities: rAmns } =
                await this._amenitiesRepository.separateHotelAndRoomAmenities(filters.amenities);

            hotelAmenities = hAmns.map(a => a._id.toString());
            roomAmenities = rAmns.map(a => a._id.toString());
        }

        const repoFilters = {
            ...filters,
            hotelAmenities,
            roomAmenities,
        };

        const { hotels, total } = await this._hotelRepository.findAllHotels(page, limit, repoFilters);

        if (!hotels || hotels.length === 0) {
            throw new AppError(HOTEL_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }


        const mappedHotelImages = await Promise.all(
            hotels.map(async (hotel) => {
                if (!hotel.images || hotel.images.length <= 0) {
                    throw new AppError(HOTEL_ERROR_MESSAGES.noImagesfound, HttpStatusCode.NOT_FOUND);
                }
                const signedHotelImages = await Promise.all(hotel.images.map(key => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt)));

                return {
                    ...hotel,
                    images: signedHotelImages,
                }
            })
        );

        const dynamicPricedHotels = await Promise.all(
            mappedHotelImages.map(async (h: any) => {
                let cheapestRoom = h.cheapestRoom;

                if (cheapestRoom) {
                    const bookedRooms = await this._bookingRepository.getBookedRoomsCount(cheapestRoom._id.toString(), filters.checkIn!, filters.checkOut!);

                    const dynamicPrice = this.calculateDynamicPrice(cheapestRoom.basePrice, cheapestRoom.roomCount, bookedRooms);

                    cheapestRoom = {
                        ...cheapestRoom,
                        basePrice: dynamicPrice,
                    };
                }

                return {
                    ...h,
                    cheapestRoom
                };
            })
        );


        const customHotelsMapping = dynamicPricedHotels.map(h => ResponseMapper.mapHotelToResponseDTO(h));

        return {
            hotels: customHotelsMapping,
            total,
            message: HOTEL_RES_MESSAGES.getHotels,
        };
    }
}
