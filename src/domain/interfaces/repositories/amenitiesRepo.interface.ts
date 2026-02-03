import { IAmenities, TCreateAmenityData, TUpdateAmenityData } from "../model/amenities.interface"

export interface IAmenitiesRepository {
    createAmenity(data: TCreateAmenityData): Promise<IAmenities | null>
    findAmenityById(amenityId: string): Promise<IAmenities | null>
    changeAmenityStatus(amenityId: string, status: boolean): Promise<IAmenities | null>
    updateAmenity(amenityId: string, data: TUpdateAmenityData): Promise<IAmenities | null>
    findAllAmenities(page: number, limit: number, rype: string, search?: string, sortField?: string, sortOrder?: string): Promise<{ amenities: IAmenities[] | null, total: number }>
    getActiveAmenities(): Promise<{ amenities: IAmenities[] | null, total: number }>
    findUsedActiveAmenities(): Promise<IAmenities[] | null>
    separateHotelAndRoomAmenities(amenityIds: string[]): Promise<{ hotelAmenities: IAmenities[], roomAmenities: IAmenities[] }>
    findDuplicateAmenity(name: string, type: 'hotel' | 'room', excludeId?: string): Promise<IAmenities | null>
}