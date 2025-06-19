import mongoose, { Schema, Document } from "mongoose";
import { IAmenities } from "../../../domain/interfaces/model/amenities.interface";

export type TAmenitiesDocument = IAmenities & Document;

const amenitiesSchema: Schema = new Schema<TAmenitiesDocument>(
    {
        name: {
            type: String,
        },
        description: {
            type: String,
        },
        type: {
            type: String,
            enum: ['hotel', 'room']
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    { timestamps: true }
);

export const amenitiesModel = mongoose.model<TAmenitiesDocument>('Amenities', amenitiesSchema);
