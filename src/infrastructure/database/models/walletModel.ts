import mongoose, { Schema, Document } from 'mongoose';
import { IWallet, IWalletTransaction } from '../../../domain/interfaces/model/wallet.interface';


export type TWalletDocument = IWallet & Document;

const transactionSchema = new Schema<IWalletTransaction>(
    {
        type: {
            type: String,
            enum: ['credit', 'debit'],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        relatedBookingId: {
            type: Schema.Types.ObjectId,
            ref: 'Booking',
        },
        date: {
            type: Date,
            default: Date.now,
            required: true,
        },
    },
    { _id: false }
);

const walletSchema = new Schema<TWalletDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        balance: {
            type: Number,
            required: true,
            default: 0,
            min: [0, 'Balance cannot be negative'],
        },
        transactions: [transactionSchema],
    },
    { timestamps: true }
);

export const walletModel = mongoose.model<TWalletDocument>('Wallet', walletSchema);
