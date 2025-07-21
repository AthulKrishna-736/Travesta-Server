import mongoose, { Document, Schema } from 'mongoose';
import { IChatMessage } from '../../../domain/interfaces/model/chat.interface';

export type TChatMessageDocument = IChatMessage & Document;

const chatMessageSchema = new Schema<TChatMessageDocument>({
    fromId: {
        type: String,
        required: true
    },
    fromRole: {
        type: String,
        enum: ['user', 'vendor', 'admin'],
        required: true
    },
    toId: {
        type: String,
        required: true
    },
    toRole: {
        type: String,
        enum: ['user', 'vendor', 'admin'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const chatMessageModel = mongoose.model<TChatMessageDocument>('ChatMessage', chatMessageSchema);
