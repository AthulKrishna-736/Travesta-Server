import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { IHotelRepository } from "../../../../domain/interfaces/repositories/hotelRepo.interface";
import { IRoomRepository } from "../../../../domain/interfaces/repositories/roomRepo.interface";
import { TResponseHotelDTO } from "../../../../interfaceAdapters/dtos/hotel.dto";
import { IGetHotelDetailWithRoomUseCase } from "../../../../domain/interfaces/model/hotel.interface";
import { AppError } from "../../../../utils/appError";
import { HOTEL_ERROR_MESSAGES, ROOM_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { IBookingRepository } from "../../../../domain/interfaces/repositories/bookingRepo.interface";
import { BED_TYPE_CAPACITY } from "../../../../domain/interfaces/model/room.interface";
import { IAwsS3Service } from "../../../../domain/interfaces/services/awsS3Service.interface";
import { TResponseRoomDTO } from "../../../../interfaceAdapters/dtos/room.dto";
import { awsS3Timer } from "../../../../infrastructure/config/jwtConfig";
import { ResponseMapper } from "../../../../utils/responseMapper";
import { calculateDynamicPricing, calculateGSTPrice, getPropertyTime, pickBestOfferForPrice } from "../../../../utils/helperFunctions";
import { IOfferRepository } from "../../../../domain/interfaces/repositories/offerRepo.interface";


@injectable()
export class GetHotelDetailsWithRoomUseCase implements IGetHotelDetailWithRoomUseCase {
    constructor(
        @inject(TOKENS.HotelRepository) private _hotelRepository: IHotelRepository,
        @inject(TOKENS.RoomRepository) private _roomRepository: IRoomRepository,
        @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository,
        @inject(TOKENS.OfferRepository) private _offerRepository: IOfferRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) { }

    async getHotelDetailWithRoom(
        hotelId: string,
        roomId: string,
        checkIn: string,
        checkOut: string,
        rooms: number,
        adults: number,
        children: number
    ): Promise<{ hotel: TResponseHotelDTO, room: TResponseRoomDTO, otherRooms: TResponseRoomDTO[], message: string }> {

        const hotel = await this._hotelRepository.findHotelById(hotelId);
        if (!hotel) throw new AppError(HOTEL_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);

        const room = await this._roomRepository.findRoomById(roomId);
        if (!room) throw new AppError(ROOM_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);

        const otherRooms = await this._roomRepository.findOtherRoomsByHotel(hotelId, roomId);


        const { checkInDate, checkOutDate } = getPropertyTime(checkIn, checkOut, hotel.propertyRules.checkInTime, hotel.propertyRules.checkOutTime)

        const isRoomAvailable = await this._bookingRepository.isRoomAvailable(roomId, rooms, checkInDate, checkOutDate)
        if (!isRoomAvailable) throw new AppError(ROOM_ERROR_MESSAGES.notAvailable, HttpStatusCode.NOT_FOUND);

        const guests = adults + children;
        const maxGuests = BED_TYPE_CAPACITY[room.bedType] * rooms;
        if (guests > maxGuests) throw new AppError(`Guest capacity exceeded for ${rooms} room(s)`, HttpStatusCode.CONFLICT);

        if (hotel.images && hotel.images.length > 0) {
            hotel.images = await Promise.all(
                hotel.images.map(async (i) => {
                    return await this._awsS3Service.getFileUrlFromAws(i, awsS3Timer.expiresAt);
                })
            );
        }

        if (rooms > 1) {
            room.basePrice = room.basePrice * rooms;
        }

        if (room.images && room.images.length > 0) {
            room.images = await Promise.all(
                room.images.map(async (i) => {
                    return await this._awsS3Service.getFileUrlFromAws(i, awsS3Timer.expiresAt);
                })
            );
        }


        const bookedRoomsCount = await this._bookingRepository.getBookedRoomsCount(roomId, checkInDate, checkOutDate);
        const dynamicPrice = calculateDynamicPricing(room.basePrice, room.roomCount, bookedRoomsCount);
        const gstPrice = calculateGSTPrice(dynamicPrice) * rooms;

        const applicableOffers = await this._offerRepository.findApplicableOffers(room.roomType, checkInDate, hotel._id!.toString());


        const totalRoomPrice = dynamicPrice;
        const { offer: bestOffer, finalPrice: discountedPrice } = pickBestOfferForPrice(totalRoomPrice, applicableOffers);

        const roomWithPricing = {
            ...ResponseMapper.mapRoomToResponseDTO(room),
            basePrice: totalRoomPrice,
            gstPrice,
            discountedPrice: bestOffer ? discountedPrice : null,
            appliedOffer: bestOffer
                ? {
                    id: bestOffer._id!.toString(),
                    name: bestOffer.name,
                    discountType: bestOffer.discountType,
                    discountValue: bestOffer.discountValue,
                    startDate: bestOffer.startDate,
                    expiryDate: bestOffer.expiryDate,
                }
                : null,
        };

        // Map and price other rooms
        const otherRoomsWithPricing = await Promise.all(
            otherRooms.map(async (r) => {
                if (r.images && r.images.length > 0) {
                    r.images = await Promise.all(
                        r.images.map(async (img) => {
                            return await this._awsS3Service.getFileUrlFromAws(img, awsS3Timer.expiresAt);
                        })
                    );
                }

                const bookedCount = await this._bookingRepository.getBookedRoomsCount(
                    r._id!.toString(),
                    checkInDate,
                    checkOutDate
                );

                if (rooms > 1) r.basePrice = r.basePrice * rooms;

                const dyn = calculateDynamicPricing(r.basePrice, r.roomCount, bookedCount);
                const gst = calculateGSTPrice(dyn);

                const offers = await this._offerRepository.findApplicableOffers(r.roomType, checkInDate, hotelId);
                const otherTotalPrice = dyn;
                const { offer: otherBestOffer, finalPrice: otherDiscountedPrice } = pickBestOfferForPrice(otherTotalPrice, offers);

                return {
                    ...ResponseMapper.mapRoomToResponseDTO(r),
                    basePrice: otherTotalPrice,
                    gstPrice: gst,
                    discountedPrice: otherBestOffer ? otherDiscountedPrice : null,
                    appliedOffer: otherBestOffer
                        ? {
                            id: otherBestOffer._id?.toString() ?? "",
                            name: otherBestOffer.name,
                            discountType: otherBestOffer.discountType,
                            discountValue: otherBestOffer.discountValue,
                            startDate: otherBestOffer.startDate,
                            expiryDate: otherBestOffer.expiryDate,
                        }
                        : null,
                };

            })
        );


        const mappedHotel = ResponseMapper.mapHotelToResponseDTO(hotel);

        return {
            hotel: mappedHotel,
            room: roomWithPricing,
            otherRooms: otherRoomsWithPricing,
            message: 'Fetched Hotel with room details successfully'
        }
    }
}