import mongoose, { Schema, Document } from "mongoose";
import { IHotel } from "../../../domain/interfaces/model/hotel.interface";

export type THotelDocument = IHotel & Document;

const hotelSchema: Schema = new Schema<THotelDocument>({
    vendorId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        default: [],
    },
    rating: {
        type: Number,
        default: 0,
    },
    amenities: [{
        type: Schema.Types.ObjectId,
        ref: "Amenities",
    }],
    tags: {
        type: [String],
        default: [],
    },
    state: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    geoLocation: {
        type: [Number],
        required: true,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

export const hotelModel = mongoose.model<THotelDocument>("Hotel", hotelSchema);
