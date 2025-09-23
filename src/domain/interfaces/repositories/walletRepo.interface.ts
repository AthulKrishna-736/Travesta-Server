import { TWalletDocument } from "../../../infrastructure/database/models/walletModel";
import { TCreateWalletData } from "../model/wallet.interface";

export interface IWalletRepository {
    createWallet(data: TCreateWalletData): Promise<TWalletDocument | null>;
    updateBalance(userId: string, amount: number): Promise<TWalletDocument | null>;
    findUserWallet(userId: string): Promise<TWalletDocument | null>
    findWalletById(walletId: string): Promise<TWalletDocument | null>
    updateBalanceByWalletId(walletId: string, amount: number): Promise<TWalletDocument | null>
}