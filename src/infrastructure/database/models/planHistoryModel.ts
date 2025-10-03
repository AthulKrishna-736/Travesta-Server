import mongoose, { Schema, Document } from 'mongoose';
import { IUserSubscriptionHistory } from '../../../domain/interfaces/model/subscription.interface';

export type TUserSubscriptionHistoryDocument = IUserSubscriptionHistory & Document;

const userSubscriptionHistorySchema = new Schema<TUserSubscriptionHistoryDocument>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true },
    subscribedAt: { type: Date, required: true, default: Date.now },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    paymentAmount: { type: Number, required: true },
}, { timestamps: true });

export const userSubscriptionHistoryModel = mongoose.model<TUserSubscriptionHistoryDocument>('SubscriptionHistory', userSubscriptionHistorySchema);
