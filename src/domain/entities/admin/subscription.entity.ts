import { TSubscription } from "../../../shared/types/client.types"
import { AppError } from "../../../utils/appError"
import { HttpStatusCode } from "../../../utils/HttpStatusCodes"
import { ISubscription, TUpdateSubscriptionData } from "../../interfaces/model/subscription.interface"


export interface ISubscriptionEntity {
    readonly id: string
    readonly name: string
    readonly description: string
    readonly type: TSubscription
    readonly price: number
    readonly duration: number
    readonly features: string[]
    readonly isActive: boolean
    readonly createdAt: Date
    readonly updatedAt: Date

    //business logic
    block(): void
    unblock(): void
    updatePlan(data: TUpdateSubscriptionData): void
    toObject(): ISubscription
    getPersistablestate(): Omit<ISubscription, '_id' | 'createdAt'>

}

export class SubscriptionEntity implements ISubscriptionEntity {
    private _props: ISubscription;

    constructor(data: ISubscription) {
        this._props = data;
    }

    get id() {
        return this._props._id
    }

    get name() {
        return this._props.name
    }

    get description() {
        return this._props.description
    }

    get type() {
        return this._props.type
    }

    get price() {
        return this._props.price
    }

    get duration() {
        return this._props.duration
    }

    get features() {
        return this._props.features
    }

    get isActive() {
        return this._props.isActive
    }

    get createdAt() {
        return this._props.createdAt
    }

    get updatedAt() {
        return this._props.updatedAt
    }

    block(): void {
        if (!this._props.isActive) {
            throw new AppError('subscription is already blocked', HttpStatusCode.CONFLICT)
        }

        this._props.isActive = false;
        this._props.updatedAt = new Date();
    }

    unblock(): void {
        if (this._props.isActive) {
            throw new AppError('subscription is already unblocked', HttpStatusCode.CONFLICT)
        }

        this._props.isActive = true;
        this._props.updatedAt = new Date();
    }

    updatePlan(data: TUpdateSubscriptionData): void {
        if (data.name && data.name.trim().length > 0 && typeof data.name == 'string') {
            this._props.name = data.name;
        }
        if (data.description && data.description.trim().length > 0 && typeof data.description == 'string') {
            this._props.description = data.description;
        }
        if (data.price && data.price > 0 && typeof data.price == 'number') {
            this._props.price = data.price;
        }
        if (data.features && Array.isArray(data.features)) {
            this._props.features = data.features;
        }
        if (data.type && ['basic', 'medium', 'vip'].includes(data.type)) {
            this._props.type = data.type;
        }
        this._props.updatedAt = new Date();
    }

    toObject(): ISubscription {
        return { ...this._props }
    }

    getPersistablestate(): Omit<ISubscription, "_id" | "createdAt"> {
        return {
            name: this._props.name,
            description: this._props.description,
            type: this._props.type,
            price: this._props.price,
            duration: this._props.duration,
            features: this._props.features,
            isActive: this._props.isActive,
            updatedAt: this._props.updatedAt,
        }
    }
}