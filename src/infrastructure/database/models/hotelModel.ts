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
        type: {
            type: String,
            enum: ["Point"],
            required: true,
            default: "Point"
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    propertyRules: {
        checkInTime: {
            type: String,
            default: '14:00',
        },
        checkOutTime: {
            type: String,
            default: '12:00',
        },
        minGuestAge: {
            type: Number,
            default: 18,
        },
        petsAllowed: {
            type: Boolean,
            default: false,
        },
        breakfastFee: {
            type: Number,
            min: 0,
        },
        outsideFoodAllowed: {
            type: Boolean,
            default: false,
        },
        idProofAccepted: {
            type: [String],
            enum: ['Aadhaar', 'Passport', 'DrivingLicense', 'PAN'],
            required: true,
        },
        specialNotes: {
            type: String,
        }
    }
}, { timestamps: true });

export const hotelModel = mongoose.model<THotelDocument>("Hotel", hotelSchema);
