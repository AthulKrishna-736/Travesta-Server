import mongoose, { Schema, Document } from "mongoose";
import { IRoom } from "../../../domain/interfaces/model/hotel.interface";

export type TRoomDocument = IRoom & Document;

const roomSchema: Schema = new Schema<TRoomDocument>({
    hotelId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Hotel",
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
    bedType: {
        type: String,
        required: true,
    },
    amenities: {
        type: [String],
        default: [],
    },
    images: {
        type: [String],
        default: [],
    },
    basePrice: {
        type: Number,
        required: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export const roomModel = mongoose.model<TRoomDocument>("Room", roomSchema);
