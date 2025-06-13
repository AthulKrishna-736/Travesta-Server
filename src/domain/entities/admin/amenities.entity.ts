import { AppError } from "../../../utils/appError"
import { HttpStatusCode } from "../../../utils/HttpStatusCodes"
import { IAmenities } from "../../interfaces/model/admin.interface"


interface IAmenitiesManage {
    readonly id: string
    readonly name: string
    readonly type: 'hotel' | 'room'
    readonly description: string
    readonly isActive: boolean
    readonly createdAt: Date
    readonly updatedAt: Date

    //business logic
    block(): void;
    unblock(): void;
    update(data: Omit<IAmenities, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>): void;
    toObject(): IAmenities;
    getPersistableData(): Omit<IAmenities, '_id' | 'isActive' | 'createdAt'>
}

export class AmenitiesManage implements IAmenitiesManage {
    private _props: IAmenities;
    constructor(amenities: IAmenities) {
        this._props = amenities
    }

    get id() {
        return this._props._id;
    }

    get name() {
        return this._props.name;
    }

    get type() {
        return this._props.type;
    }

    get description() {
        return this._props.description;
    }

    get isActive() {
        return this._props.isActive;
    }

    get createdAt() {
        return this._props.createdAt;
    }

    get updatedAt() {
        return this._props.updatedAt;
    }

    block(): void {
        if (!this._props.isActive) {
            throw new AppError('amenities is already blocked', HttpStatusCode.CONFLICT);
        }

        this._props.isActive = false;
        this._props.updatedAt = new Date();
    }

    unblock(): void {
        if (this._props.isActive) {
            throw new AppError('amenities is not blocked', HttpStatusCode.CONFLICT);
        }

        this._props.isActive = true;
        this._props.updatedAt = new Date();
    }

    update(data: Omit<IAmenities, "_id" | "createdAt" | "updatedAt" | "isActive">): void {
        if (data.name && data.name.trim().length > 0 && typeof data.name == 'string') {
            this._props.name = data.name.trim();
        }
        if (data.description && data.description.trim().length > 0 && typeof data.description == 'string') {
            this._props.description = data.description.trim();
        }
        if (data.type && (data.type == 'hotel' || data.type == 'room')) {
            this._props.type = data.type;
        }
        this._props.updatedAt = new Date();
    }

    toObject(): IAmenities {
        return { ...this._props }
    }

    getPersistableData(): Omit<IAmenities, "_id" | "isActive" | "createdAt"> {
        return {
            name: this._props.name,
            description: this._props.description,
            type: this._props.type,
            updatedAt: this._props.updatedAt,
        }
    }
}