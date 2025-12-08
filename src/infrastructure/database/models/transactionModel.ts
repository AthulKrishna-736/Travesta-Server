import mongoose, { Document, Schema, Types } from "mongoose";
import { ITransactions } from "../../../domain/interfaces/model/wallet.interface";

export type TTransactionDoc = ITransactions & Document;

const transactionSchema = new Schema<TTransactionDoc>({
    walletId: {
        type: Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true,
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true,
    },
    amount: {
        type: Number,
        min: 0,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    transactionId: {
        type: String,
        unique: true,
        required: true,
    },
    relatedEntityId: {
        type: Types.ObjectId,
    },
    relatedEntityType: {
        type: String,
        enum: ['Booking', 'Subscription'],
    }
}, { timestamps: true });

export const transactionModel = mongoose.model<TTransactionDoc>('Transactions', transactionSchema)