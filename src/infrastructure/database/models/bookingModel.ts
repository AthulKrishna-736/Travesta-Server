import mongoose, { Schema, Document } from 'mongoose';
import { IBooking } from '../../../domain/interfaces/model/booking.interface';

export type TBookingDocument = IBooking & Document;

const bookingSchema: Schema = new Schema<TBookingDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        hotelId: {
            type: Schema.Types.ObjectId,
            ref: 'Hotel',
            required: true
        },
        roomId: {
            type: Schema.Types.ObjectId,
            ref: 'Room',
            required: true
        },
        checkIn: {
            type: Date,
            required: true
        },
        checkOut: {
            type: Date,
            required: true
        },
        guests: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        },
        roomsCount: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },
        couponId: {
            type: Schema.Types.ObjectId,
            ref: 'Coupon',
            default: null
        },
        bookingId: {
            type: String,
            unique: true,
            required: true,
        },
        status: {
            type: String,
            enum: ['confirmed', 'cancelled', 'pending'],
            default: 'pending',
        },
        payment: {
            type: String,
            enum: ['pending', 'success', 'failed', 'refunded'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

export const bookingModel = mongoose.model<TBookingDocument>('Booking', bookingSchema);
