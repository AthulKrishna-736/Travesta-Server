import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../constants/token';
import { IWalletRepository } from '../../../../domain/interfaces/repositories/repository.interface';
import { IGetWalletUseCase, IWallet } from '../../../../domain/interfaces/model/wallet.interface';
import { AppError } from '../../../../utils/appError';
import { HttpStatusCode } from '../../../../utils/HttpStatusCodes';

@injectable()
export class GetWalletUseCase implements IGetWalletUseCase {
    constructor(
        @inject(TOKENS.WalletRepository) private _walletRepo: IWalletRepository
    ) { }

    async getUserWallet(userId: string, page: number, limit: number): Promise<{ wallet: IWallet | null, total: number }> {
        const checkWallet = await this._walletRepo.findWalletExist(userId);

        if (!checkWallet) {
            throw new AppError('Wallet not found', HttpStatusCode.NOT_FOUND);
        }

        const { wallet, total } = await this._walletRepo.findUserWallet(userId, page, limit);

        return { wallet, total };
    }
}
