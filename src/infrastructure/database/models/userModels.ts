import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../../../domain/interfaces/user.interface";

export type UserDocument = IUser & Document

const userSchema: Schema = new Schema<UserDocument>({
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
    isKycVerified: {
        type: Boolean,
        default: false
    },
    kycDocuments: [{
        type: String
    }]
}, { timestamps: true })

export const userModel = mongoose.model<UserDocument>('User', userSchema)