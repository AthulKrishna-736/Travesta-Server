import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../constants/token';
import { IWalletRepository } from '../../../../domain/interfaces/repositories/repository.interface';
import { IGetWalletUseCase, IWallet } from '../../../../domain/interfaces/model/wallet.interface';
import { AppError } from '../../../../utils/appError';
import { HttpStatusCode } from '../../../../constants/HttpStatusCodes';
import { WALLET_RES_MESSAGES } from '../../../../constants/resMessages';

@injectable()
export class GetWalletUseCase implements IGetWalletUseCase {
    constructor(
        @inject(TOKENS.WalletRepository) private _walletRepository: IWalletRepository
    ) { }

    async getUserWallet(userId: string): Promise<{ wallet: IWallet | null, message: string }> {
        const wallet = await this._walletRepository.findUserWallet(userId);

        if (!wallet) {
            throw new AppError('Wallet not found', HttpStatusCode.NOT_FOUND);
        }
        
        return { wallet, message: WALLET_RES_MESSAGES.getWallet };
    }
}
