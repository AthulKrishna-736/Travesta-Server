import mongoose, { Document, Schema } from "mongoose";
import { IOffer } from "../../../domain/interfaces/model/offer.interface";

export type TOfferDocument = IOffer & Document;

const OfferSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
        default: null,
    },
    roomType: {
        type: String,
        enum: ["AC", "Non-AC", "Deluxe", "Suite", "Standard"],
        required: true,
    },
    discountType: {
        type: String,
        enum: ["flat", "percent"],
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
        min: 1,
    },
    startDate: {
        type: Date,
        required: true,
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });


export const offerModel = mongoose.model<TOfferDocument>("Offer", OfferSchema);
