import mongoose, { Schema, Document } from 'mongoose';
import { ISubscription } from '../../../domain/interfaces/model/subscription.interface';

export type TSubscriptionDocument = ISubscription & Document;

const subscriptionSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ['basic', 'medium', 'vip'],
            required: true,
            unique: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        duration: {
            type: Number,
            required: true,
            min: 1,
        },
        features: {
            type: [String],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true, }
);

export const subscriptionModel = mongoose.model<TSubscriptionDocument>('Subscription', subscriptionSchema);
