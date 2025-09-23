import { TRelatedType, TTransactionType } from "../../domain/interfaces/model/wallet.interface";

export type TCreateTransactionDTO = {
    walletId: string;
    type: TTransactionType;
    amount: number;
    description: string;
    transactionId?: string;
    relatedEntityId?: string;
    relatedEntityType?: TRelatedType;
}

export type TResponseTransactionDTO = {
    id: string;
    walletId: string;
    type: TTransactionType;
    amount: number;
    description: string;
    transactionId?: string;
    relatedEntityId?: string;
    relatedEntityType?: TRelatedType;
    createdAt: Date;
    updatedAt: Date;
}