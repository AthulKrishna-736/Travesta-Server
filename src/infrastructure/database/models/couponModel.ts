import mongoose, { Document, Schema } from "mongoose";
import { ICoupon } from "../../../domain/interfaces/model/coupon.interface";

export type TCouponDocument = ICoupon & Document

const couponSchema = new Schema({
    vendorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['flat', 'percent'],
        required: true,
    },
    value: {
        type: Number,
        required: true,
    },
    minPrice: {
        type: Number,
        required: true,
    },
    maxPrice: {
        type: Number,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    count: {
        type: Number,
        required: true,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

couponSchema.index({ name: 1 });
couponSchema.index({ code: 1 });

export const couponModel = mongoose.model<TCouponDocument>('Coupon', couponSchema);