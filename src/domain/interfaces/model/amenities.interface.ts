import { TCreateAmenityDTO, TResponseAmenityDTO, TUpdateAmenityDTO } from "../../../interfaceAdapters/dtos/amenity.dto";

export type TAmenityType = 'hotel' | 'room';

//amenity model
export interface IAmenities {
    _id: string;
    name: string;
    type: TAmenityType;
    description: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

//amenity types
export type TCreateAmenityData = Omit<IAmenities, '_id' | 'createdAt' | 'updatedAt' | 'isActive'>
export type TUpdateAmenityData = Partial<Omit<IAmenities, '_id' | 'createdAt' | 'updatedAt'>>
export type TResponseAmenityData = Omit<IAmenities, ''>

// amenity use cases
export interface ICreateAmenityUseCase {
    createAmenity(data: TCreateAmenityDTO): Promise<{ amenity: TResponseAmenityDTO, message: string }>
}

export interface IUpdateAmenityUseCase {
    updateAmenity(amenityId: string, data: TUpdateAmenityDTO): Promise<{ amenity: TResponseAmenityDTO, message: string }>
}

export interface IGetAmenityByIdUseCase {
    getAmenityById(amenityId: string): Promise<{ amenity: TResponseAmenityDTO, message: string }>
}

export interface IGetAllAmenitiesUseCase {
    getAllAmenitiesUseCase(page: number, limit: number, type: string, search?: string, sortField?: string, sortOrder?: string): Promise<{ amenities: TResponseAmenityDTO[], message: string, total: number }>
}

export interface IBlockUnblockAmenityUseCase {
    blockUnblockAmenityUseCase(amenityId: string): Promise<{ amenity: TResponseAmenityDTO, message: string }>
}

export interface IGetActiveAmenitiesUseCase {
    getActiveAmenities(): Promise<{ amenities: TResponseAmenityDTO[], message: string, total: number }>
}

export interface IFindUsedActiveAmenitiesUseCase {
    findUsedActiveAmenities(): Promise<{ amenities: TResponseAmenityDTO[], message: string, total: number }>;
}
