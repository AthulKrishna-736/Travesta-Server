import mongoose, { Schema, Document } from "mongoose";
import { IRoom } from "../../../domain/interfaces/model/room.interface";
import slugify from "slugify";

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
        slug: {
            type: String,
            required: true,
            index: true,
        },
        roomType: {
            type: String,
            enum: ["AC", "Non-AC", "Deluxe", "Suite", "Standard"],
            required: true,
        },
        roomCount: {
            type: Number,
            required: true,
        },
        bedType: {
            type: String,
            enum: ['King', 'Queen', 'Double', 'Single', 'TwinDouble', 'TwinQueen'],
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

roomSchema.index({ hotelId: 1, slug: 1 }, { unique: true });

roomSchema.pre<TRoomDocument>("validate", async function (next) {
    if (!this.isNew) return next();
    if (this.slug) return next();
    if (!this.name || !this.hotelId) return next();

    const baseSlug = slugify(this.name, { lower: true, strict: true });

    const regex = new RegExp(`^${baseSlug}(?:-(\\d+))?$`);

    const Room = this.constructor as mongoose.Model<TRoomDocument>;

    const existingSlugs = await Room.find({ hotelId: this.hotelId, slug: regex }).select("slug").lean<{ slug: string }[]>();

    let maxCounter = 0;

    for (const doc of existingSlugs) {
        const match = doc.slug.match(/-(\d+)$/);
        if (match) {
            maxCounter = Math.max(maxCounter, Number(match[1]));
        }
    }

    this.slug = maxCounter === 0 ? baseSlug : `${baseSlug}-${maxCounter + 1}`;

    next();
});

export const roomModel = mongoose.model<TRoomDocument>("Room", roomSchema);
