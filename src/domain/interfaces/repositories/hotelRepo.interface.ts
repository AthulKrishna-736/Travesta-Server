import { IHotel, TCreateHotelData, TUpdateHotelData } from "../model/hotel.interface";
import { IRoom } from "../model/room.interface";

export interface IHotelRepository {
    createHotel(data: TCreateHotelData): Promise<IHotel | null>;
    findHotelById(hotelId: string): Promise<IHotel | null>;
    updateHotel(hotelId: string, data: TUpdateHotelData): Promise<IHotel | null>;
    findDuplicateHotels(hotelName: string): Promise<boolean>;
    findHotelByVendor(vendorId: string, hotelId: string): Promise<IHotel | null>
    findHotelsByVendor(vendorId: string, page: number, limit: number, search?: string): Promise<{ hotels: IHotel[] | null, total: number }>;
    findAllHotels(
        page: number,
        limit: number,
        checkIn: string,
        checkOut: string,
        geoLocation: { long: number, lat: number },
        search?: string,
        hotelAmenities?: string[],
        roomAmenities?: string[],
        roomType?: string[],
        minPrice?: number,
        maxPrice?: number,
        sort?: string,
    ): Promise<{ hotels: Array<IHotel & { rooms: IRoom[], bookings: { _id: string, bookedRooms: number }[] }> | null; total: number }>;
}