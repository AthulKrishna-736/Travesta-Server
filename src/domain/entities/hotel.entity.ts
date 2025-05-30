import { Types } from "mongoose"
import { IHotel } from "../interfaces/model/hotel.interface"


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



}

export class HotelEntity implements IHotelEntity {
    private _props: IHotel

    constructor(data: IHotel) {
        this._props = data
    }

    get id(){
        return this._props._id
    }

    get vendorId(){
        return this._props.vendorId
    }

    get name(){
        return this._props.name
    }

    get description(){
        return this._props.description
    }

    get images(){
        return this._props.images
    }

    get rating(){
        return this._props.rating
    }

    get services(){
        return this._props.services
    }

    get amenities(){
        return this._props.amenities
    }

    get tags(){
        return this._props.tags
    }

    get state(){
        return this._props.state
    }

    get city(){
        return this._props.city
    }

    get address(){
        return this._props.address
    }

    get geoLocation(){
        return this._props.geoLocation
    }

    get isBlocked(){
        return this._props.isBlocked
    }

    get createdAt(){
        return this._props.createdAt
    }

    get updatedAt(){
        return this._props.updatedAt
    }


}