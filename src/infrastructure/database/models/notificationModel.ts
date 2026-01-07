import mongoose, { Schema, Document } from 'mongoose';
import { INotification } from '../../../domain/interfaces/model/notification.interface';
import { Response } from 'express';

export type TNotificationDocument = INotification & Document;

const notificationSchema = new Schema<TNotificationDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 255
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export const notificationModel = mongoose.model<TNotificationDocument>('Notification', notificationSchema);

export const notificationClients = new Map<string, Response>();