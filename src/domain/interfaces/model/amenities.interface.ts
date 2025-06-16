
//amenity model
export interface IAmenities {
    _id: string
    name: string
    type: 'hotel' | 'room'
    description: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

//amenity types
export type TCreateAmenityData = Omit<IAmenities, '_id' | 'createdAt' | 'updatedAt' | 'isActive'>
export type TUpdateAmenityData = Partial<Omit<IAmenities, '_id' | 'createdAt' | 'updatedAt'>>
export type TResponseAmenityData = Omit<IAmenities, ''>

// amenity use cases
export interface ICreateAmenityUseCase {
    createAmenity(data: TCreateAmenityData): Promise<TResponseAmenityData>
}

export interface IUpdateAmenityUseCase {
    updateAmenity(amenityId: string, data: TUpdateAmenityData): Promise<{ amenity: TResponseAmenityData, message: string }>
}

export interface IGetAmenityByIdUseCase {
    getAmenityById(amenityId: string): Promise<{ amenity: TResponseAmenityData, message: string }>
}

export interface IGetAllAmenitiesUseCase {
    getAllAmenitiesUseCase(): Promise<{ amenities: TResponseAmenityData[], message: string}>
}

export interface IBlockUnblockAmenityUseCase {
    blockUnblockAmenityUseCase(amenityId: string): Promise<{ amenity: TResponseAmenityData, message: string }>
}