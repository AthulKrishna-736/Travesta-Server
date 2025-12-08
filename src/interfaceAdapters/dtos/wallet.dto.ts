
export type TCreateWalletDTO = {
    userId: string;
    balance: number;
}

export type TUpdateWalletDTO = {
    userId: string;
    balance: number;
}

export type TResponseWalletDTO = {
    id: string;
    userId: string;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
}