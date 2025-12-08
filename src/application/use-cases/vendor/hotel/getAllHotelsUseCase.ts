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
import { IRatingRepository } from "../../../../domain/interfaces/repositories/ratingRepo.interface";
import { calculateDynamicPricing, calculateGSTPrice, getPropertyTime, pickBestOfferForPrice } from "../../../../utils/helperFunctions";
import { TResponseRoomDTO } from "../../../../interfaceAdapters/dtos/room.dto";
import { IRoom } from "../../../../domain/interfaces/model/room.interface";
import { IOffer } from "../../../../domain/interfaces/model/offer.interface";
import { IOfferRepository } from "../../../../domain/interfaces/repositories/offerRepo.interface";


@injectable()
export class GetAllHotelsUseCase implements IGetAllHotelsUseCase {
    constructor(
        @inject(TOKENS.HotelRepository) private _hotelRepository: IHotelRepository,
        @inject(TOKENS.AmenitiesRepository) private _amenitiesRepository: IAmenitiesRepository,
        @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository,
        @inject(TOKENS.RatingRepository) private _ratingRepository: IRatingRepository,
        @inject(TOKENS.OfferRepository) private _offerRepository: IOfferRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) { }

    async getAllHotel(
        page: number,
        limit: number,
        checkIn: string,
        checkOut: string,
        rooms: number,
        adults: number,
        children: number,
        geoLocation: { long: number, lat: number },
        search?: string,
        amenities?: string[],
        roomType?: string[],
        minPrice?: number,
        maxPrice?: number,
        rating?: number,
        sort?: string,
    ): Promise<{ hotels: (TResponseHotelDTO & { room: TResponseRoomDTO })[]; total: number; message: string }> {

        let hotelAmenities: string[] = [];
        let roomAmenities: string[] = [];

        if (amenities && amenities.length > 0) {
            const { hotelAmenities: hAmns, roomAmenities: rAmns } = await this._amenitiesRepository.separateHotelAndRoomAmenities(amenities);

            hotelAmenities = hAmns.map(a => a._id.toString());
            roomAmenities = rAmns.map(a => a._id.toString());
        }


        const { hotels, total } = await this._hotelRepository.findAllHotels(
            page,
            limit,
            checkIn,
            checkOut,
            geoLocation,
            search,
            hotelAmenities,
            roomAmenities,
            roomType,
            minPrice,
            maxPrice,
            rating,
            sort
        );

        if (!hotels || hotels.length === 0) {
            throw new AppError(HOTEL_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const TOTAL_GUESTS = adults + children;

        const validatedHotels = hotels.map((h) => {
            if (h.rooms && h.rooms.length <= 0) return null;

            let cheapestRoom: IRoom | null = null;

            for (const room of h.rooms) {
                const bookingInfo = h.bookings?.find(b => b._id.toString() === room._id!.toString());
                const bookedRooms = bookingInfo?.bookedRooms ?? 0;
                const availableRooms = room.roomCount - bookedRooms;

                if (availableRooms < rooms) continue;
                const totalCapacity = room.guest * rooms;
                if (totalCapacity < TOTAL_GUESTS) continue;

                if (!cheapestRoom) {
                    cheapestRoom = room;
                    break;
                }
                cheapestRoom = room;
                break;
            }

            if (!cheapestRoom) return null;

            return {
                ...h,
                cheapestRoom,
            };

        }).filter((h): h is typeof h & { cheapestRoom: IRoom } => h !== null && h.cheapestRoom !== null);

        if (validatedHotels && validatedHotels.length == 0) {
            throw new AppError(HOTEL_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const enrichedHotels = await Promise.all(
            validatedHotels.map(async (hotel) => {

                const signedImages = await Promise.all(
                    hotel.images.map(key => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt))
                );

                const { checkInDate, checkOutDate } = getPropertyTime(checkIn, checkOut, hotel.propertyRules.checkInTime, hotel.propertyRules.checkOutTime);

                const bookedRooms = await this._bookingRepository.getBookedRoomsCount(hotel.cheapestRoom._id!.toString(), checkInDate, checkOutDate);

                const DYNAMIC_ROOM_PRICE = calculateDynamicPricing(hotel.cheapestRoom.basePrice, hotel.cheapestRoom.roomCount, bookedRooms);
                const TOTAL_ROOM_PRICE = DYNAMIC_ROOM_PRICE * rooms;
                const TOTAL_GST_PRICE = calculateGSTPrice(hotel.cheapestRoom.basePrice) * rooms

                const applicableDate = checkInDate || new Date();
                const offers: IOffer[] = await this._offerRepository.findApplicableOffers(hotel.cheapestRoom.roomType, applicableDate, hotel._id ? hotel._id.toString() : null);

                const { offer: bestOffer, finalPrice: bestPrice } = pickBestOfferForPrice(TOTAL_ROOM_PRICE, offers);
                const discountedPrice = bestOffer ? bestPrice : TOTAL_ROOM_PRICE;

                const roomWithPricing = {
                    ...hotel.cheapestRoom,
                    basePrice: TOTAL_ROOM_PRICE,
                    gstPrice: TOTAL_GST_PRICE,
                    discountedPrice,
                    appliedOffer: bestOffer
                        ? {
                            id: (bestOffer._id as any)?.toString?.() ?? bestOffer._id,
                            name: (bestOffer as any).name ?? undefined,
                            discountType: bestOffer.discountType,
                            discountValue: bestOffer.discountValue,
                            startDate: bestOffer.startDate,
                            expiryDate: bestOffer.expiryDate,
                        }
                        : null,
                };

                // get rating
                const ratingSummary = await this._ratingRepository.getHotelRatingSummary(hotel._id!.toString());

                return {
                    ...hotel,
                    cheapestRoom: roomWithPricing,
                    images: signedImages,
                    rating: ratingSummary,
                };
            })
        );

        if (sort === "price_asc") {
            enrichedHotels.sort((a, b) => a.cheapestRoom.basePrice - b.cheapestRoom.basePrice);
        }
        else if (sort === "price_desc") {
            enrichedHotels.sort((a, b) => b.cheapestRoom.basePrice - a.cheapestRoom.basePrice);
        }


        const customHotelsMapping = enrichedHotels.map((h) => {
            const mappedHotel = ResponseMapper.mapHotelToResponseDTO(h);
            const mappedRoom = ResponseMapper.mapRoomToResponseDTO(h.cheapestRoom);

            return {
                ...mappedHotel,
                room: {
                    ...mappedRoom,
                    discountedPrice: h.cheapestRoom.discountedPrice,
                    appliedOffer: h.cheapestRoom.appliedOffer ?? null,
                }
            }
        });

        return {
            hotels: customHotelsMapping,
            total,
            message: HOTEL_RES_MESSAGES.getHotels,
        };
    }
}
