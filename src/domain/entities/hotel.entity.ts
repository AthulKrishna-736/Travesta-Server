import { Types } from "mongoose"
import { IHotel, TUpdateHotelData } from "../interfaces/model/hotel.interface"
import { AppError } from "../../utils/appError"
import { HttpStatusCode } from "../../constants/HttpStatusCodes"


export interface IHotelEntity {
    readonly id: string | undefined
    readonly vendorId: string | Types.ObjectId
    readonly name: string
    readonly description: string
    readonly images: string[]
    readonly rating: number
    readonly amenities: string[]
    readonly tags: string[]
    readonly state: string
    readonly city: string
    readonly address: string
    readonly geoLocation: [number, number]
    readonly isBlocked: boolean
    readonly createdAt: Date
    readonly updatedAt: Date


    //business logic
    block(): void
    unblock(): void
    updateHotel(data: TUpdateHotelData): void
    getPersistableData(): Partial<Omit<IHotel, '_id' | 'createdAt' | 'vendorId'>>
    toObject(): IHotel

}

export class HotelEntity implements IHotelEntity {
    private _props: IHotel

    constructor(data: IHotel) {
        this._props = data
    }

    get id() {
        return this._props._id
    }

    get vendorId() {
        return this._props.vendorId
    }

    get name() {
        return this._props.name
    }

    get description() {
        return this._props.description
    }

    get images() {
        return this._props.images
    }

    get rating() {
        return this._props.rating
    }

    get amenities() {
        return this._props.amenities
    }

    get tags() {
        return this._props.tags
    }

    get state() {
        return this._props.state
    }

    get city() {
        return this._props.city
    }

    get address() {
        return this._props.address
    }

    get geoLocation() {
        return this._props.geoLocation
    }

    get isBlocked() {
        return this._props.isBlocked
    }

    get createdAt() {
        return this._props.createdAt
    }

    get updatedAt() {
        return this._props.updatedAt
    }

    //business logic
    block(): void {
        if (this._props.isBlocked) {
            throw new AppError('Hotel is already blocked', HttpStatusCode.CONFLICT)
        }
        this._props.isBlocked = true;
        this._props.updatedAt = new Date();
    }

    unblock(): void {
        if (!this._props.isBlocked) {
            throw new AppError('Hotel is already unblocked', HttpStatusCode.CONFLICT)
        }
        this._props.isBlocked = false
        this._props.updatedAt = new Date();
    }

    updateHotel(data: TUpdateHotelData): void {
        if (data.name && typeof data.name === 'string' && data.name.trim().length > 0) {
            this._props.name = data.name.trim()
        }

        if (data.description && typeof data.description === 'string' && data.description.trim().length > 0) {
            this._props.description = data.description.trim()
        }

        if (Array.isArray(data.images) && data.images.every(img => typeof img === 'string') && data.images.length > 0) {
            this._props.images = data.images
        }

        if (typeof data.rating === 'number' && data.rating >= 0 && data.rating <= 5) {
            this._props.rating = data.rating
        }

        if (Array.isArray(data.amenities) && data.amenities.every(a => typeof a === 'string')) {
            this._props.amenities = data.amenities
        }

        if (Array.isArray(data.tags) && data.tags.every(t => typeof t === 'string')) {
            this._props.tags = data.tags
        }

        if (data.state && typeof data.state === 'string' && data.state.trim().length > 0) {
            this._props.state = data.state.trim()
        }

        if (data.city && typeof data.city === 'string' && data.city.trim().length > 0) {
            this._props.city = data.city.trim()
        }

        if (data.address && typeof data.address === 'string' && data.address.trim().length > 0) {
            this._props.address = data.address.trim()
        }

        if (Array.isArray(data.geoLocation) && data.geoLocation.length === 2 && typeof data.geoLocation[0] === 'number' && typeof data.geoLocation[1] === 'number') {
            this._props.geoLocation = data.geoLocation
        }

        this._props.updatedAt = new Date()
    }

    getPersistableData(): Partial<Omit<IHotel, "_id" | "createdAt" | "vendorId" | 'isBlocked'>> {
        return {
            name: this._props.name,
            description: this._props.description,
            images: this._props.images,
            rating: this._props.rating,
            amenities: this._props.amenities,
            tags: this._props.tags,
            state: this._props.state,
            city: this._props.city,
            address: this._props.address,
            geoLocation: this._props.geoLocation,
            updatedAt: this._props.updatedAt,
        }
    }

    toObject(): IHotel {
        return { ...this._props }
    }

}