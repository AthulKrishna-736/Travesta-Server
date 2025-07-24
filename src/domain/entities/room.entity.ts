import { Types } from "mongoose";
import { IRoom, TUpdateRoomData } from "../interfaces/model/room.interface";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";
import { AppError } from "../../utils/appError";


export interface IRoomEntity {
    readonly id: string | undefined;
    readonly hotelId: string | Types.ObjectId;
    readonly name: string;
    readonly capacity: number;
    readonly bedType: string;
    readonly amenities: string[];
    readonly images: string[];
    readonly basePrice: number;
    readonly isAvailable: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    // Business Logic
    markUnavailable(): void;
    markAvailable(): void;
    updateRoom(data: TUpdateRoomData): void;
    getPersistableData(): Partial<Omit<IRoom, '_id' | 'createdAt' | 'hotelId'>>;
    toObject(): IRoom;
}

export class RoomEntity implements IRoomEntity {
    private _props: IRoom;

    constructor(data: IRoom) {
        this._props = data;
    }

    get id() {
        return this._props._id;
    }

    get hotelId() {
        return this._props.hotelId;
    }

    get name() {
        return this._props.name;
    }

    get capacity() {
        return this._props.capacity;
    }

    get bedType() {
        return this._props.bedType;
    }

    get amenities() {
        return this._props.amenities;
    }

    get images() {
        return this._props.images;
    }

    get basePrice() {
        return this._props.basePrice;
    }

    get isAvailable() {
        return this._props.isAvailable;
    }

    get createdAt() {
        return this._props.createdAt;
    }

    get updatedAt() {
        return this._props.updatedAt;
    }

    // Business Logic
    markUnavailable(): void {
        if (!this._props.isAvailable) {
            throw new AppError("Room is already marked unavailable", HttpStatusCode.CONFLICT);
        }
        this._props.isAvailable = false;
        this._props.updatedAt = new Date();
    }

    markAvailable(): void {
        if (this._props.isAvailable) {
            throw new AppError("Room is already available", HttpStatusCode.CONFLICT);
        }
        this._props.isAvailable = true;
        this._props.updatedAt = new Date();
    }

    updateRoom(data: TUpdateRoomData): void {
        if (data.name && typeof data.name === 'string' && data.name.trim().length > 0) {
            this._props.name = data.name.trim();
        }

        if (typeof data.capacity === 'number' && data.capacity > 0) {
            this._props.capacity = data.capacity;
        }

        if (data.bedType && typeof data.bedType === 'string' && data.bedType.trim().length > 0) {
            this._props.bedType = data.bedType.trim();
        }

        if (Array.isArray(data.amenities) && data.amenities.every(a => typeof a === 'string')) {
            this._props.amenities = data.amenities;
        }

        if (Array.isArray(data.images) && data.images.every(i => typeof i === 'string') && data.images.length > 0) {
            this._props.images = data.images;
        }

        if (typeof data.basePrice === 'number' && data.basePrice >= 0) {
            this._props.basePrice = data.basePrice;
        }

        this._props.updatedAt = new Date();
    }

    getPersistableData(): Partial<Omit<IRoom, "_id" | "createdAt" | "hotelId">> {
        return {
            name: this._props.name,
            capacity: this._props.capacity,
            bedType: this._props.bedType,
            amenities: this._props.amenities,
            images: this._props.images,
            basePrice: this._props.basePrice,
            isAvailable: this._props.isAvailable,
            updatedAt: this._props.updatedAt,
        };
    }

    toObject(): IRoom {
        return { ...this._props };
    }
}



