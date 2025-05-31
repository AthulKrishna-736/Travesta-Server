import { Types } from "mongoose"
import { IHotel, TUpdateHotelData } from "../interfaces/model/hotel.interface"
import { AppError } from "../../utils/appError"
import { HttpStatusCode } from "../../utils/HttpStatusCodes"


export interface IHotelEntity {
    readonly id: string | undefined
    readonly vendorId: string | Types.ObjectId
    readonly name: string
    readonly description: string
    readonly images: string[]
    readonly rating: number
    readonly services: string[]
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
    update(data: TUpdateHotelData): void


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

    get services() {
        return this._props.services
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
        this._props.isBlocked = false;
        this._props.updatedAt = new Date();
    }

    unblock(): void {
        if (!this._props.isBlocked) {
            throw new AppError('Hotel is already unblocked', HttpStatusCode.CONFLICT)
        }
    }

    update(data: TUpdateHotelData): void {
        if (data.name) this._props.name = data.name
        if (data.description) this._props.description = data.description
        if (data.images) this._props.images = data.images
        if (data.rating) this._props.rating = data.rating
        if (data.services) this._props.services = data.services
        if (data.amenities) this._props.amenities = data.amenities
        if (data.tags) this._props.tags = data.tags
        if (data.state) this._props.state = data.state
        if (data.city) this._props.city = data.city
        if (data.address) this._props.address = data.address
        if (data.geoLocation) this._props.geoLocation = data.geoLocation
        this._props.updatedAt = new Date()
    }

    


}