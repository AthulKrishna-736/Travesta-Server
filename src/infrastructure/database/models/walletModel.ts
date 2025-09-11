import mongoose, { Schema, Document } from 'mongoose';
import { IWallet } from '../../../domain/interfaces/model/wallet.interface';

export type TWalletDocument = IWallet & Document;

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
    },
    { timestamps: true }
);

export const walletModel = mongoose.model<TWalletDocument>('Wallet', walletSchema);
