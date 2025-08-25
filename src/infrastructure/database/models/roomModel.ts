import mongoose, { Schema, Document } from "mongoose";
import { BedType, IRoom } from "../../../domain/interfaces/model/room.interface";

export type TRoomDocument = IRoom & Document;

const roomSchema: Schema = new Schema<TRoomDocument>(
    {
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
        roomType: {
            type: String,
            enum: ["AC", "Non-AC", "Deluxe", "Suite", "Standard", "Penthouse"],
            required: true,
        },
        roomCount: {
            type: Number,
            required: true,
        },
        bedType: {
            type: String,
            enum: Object.values(BedType),
            required: true,
        },
        guest: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        amenities: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Amenities",
        }],
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
    },
    { timestamps: true }
);

export const roomModel = mongoose.model<TRoomDocument>("Room", roomSchema);
