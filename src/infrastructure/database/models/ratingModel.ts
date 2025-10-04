import mongoose, { Document, Schema } from "mongoose";
import { IRating } from "../../../domain/interfaces/model/rating.interface";

export type TRatingDocument = IRating & Document;

const ratingSchema = new Schema({
    hotelId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Hotel',
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    hospitality: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    cleanliness: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    facilities: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    room: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    moneyValue: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
}, { timestamps: true });


export const ratingModel = mongoose.model<TRatingDocument>('Rating', ratingSchema);