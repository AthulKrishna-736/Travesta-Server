
export interface IHotel {
    _id?: string
    vendorId: string
    name: string
    description: string
    images: string[]
    rating: number
    services: string[]
    amenities: string[]
    tags: string[]
    state: string
    city: string
    address: string
    geoLocation: [number, number]
    isBlocked: boolean
    createdAt: Date
    updatedAt: Date
}

export interface IRoom {
    _id?: string
    hotelId: string
    name: string
    capacity: number
    bedType: string
    amenities: string[]
    images: string[]
    basePrice: number
    isAvailable: boolean
    createdAt: Date
    updatedAt: Date
}

