import { IHotel, TCreateHotelData, TUpdateHotelData } from "../model/hotel.interface";

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
        filters?: {
            search?: string;
            hotelAmenities?: string[];
            roomAmenities?: string[];
            roomType?: string[];
            checkIn?: string;
            checkOut?: string;
            guests?: number;
            minPrice?: number;
            maxPrice?: number;
            sort?: string;
        }
    ): Promise<{ hotels: IHotel[] | null; total: number }>;
    getHotelAnalytics(hotelId: string, period: 'week' | 'month' | 'year'): Promise<any>
}