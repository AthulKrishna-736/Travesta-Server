import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../../../domain/interfaces/user.interface";

export type TUserDocument = IUser & Document

const userSchema: Schema = new Schema<TUserDocument>({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    isGoogle: {
        type: Boolean,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'vendor', 'admin'],
        default: 'user'
    },
    phone: {
        type: Number,
        required: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    subscriptionType: {
        type: String,
        enum: ['basic', 'medium', 'vip'],
        default: 'basic'
    },
    profileImage: {
        type: String
    },
    wishlist: [{
        type: String
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationReason: {
        type: String,
        default: '',
        trim: true
    },
    kycDocuments: [{
        type: String
    }]
}, { timestamps: true })

export const userModel = mongoose.model<TUserDocument>('User', userSchema)