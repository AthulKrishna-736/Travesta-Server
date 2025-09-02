import { inject, injectable } from 'tsyringe';
import { AppError } from '../../../../utils/appError';
import { HttpStatusCode } from '../../../../utils/HttpStatusCodes';
import { TOKENS } from '../../../../constants/token';
import { IWalletRepository } from '../../../../domain/interfaces/repositories/repository.interface';
import { ICreateWalletUseCase, TCreateWalletData, TResponseWalletData } from '../../../../domain/interfaces/model/wallet.interface';
import { WALLET_RES_MESSAGES } from '../../../../constants/resMessages';

@injectable()
export class CreateWalletUseCase implements ICreateWalletUseCase {
    constructor(
        @inject(TOKENS.WalletRepository) private _walletRepo: IWalletRepository,
    ) { }

    async createUserWallet(userId: string): Promise<{ wallet: TResponseWalletData, message: string }> {
        const walletExist = await this._walletRepo.findUserWallet(userId);

        if (walletExist) {
            throw new AppError('Wallet already exist', HttpStatusCode.CONFLICT);
        }

        const walledData: TCreateWalletData = {
            userId,
            balance: 0,
        }

        const created = await this._walletRepo.createWallet(walledData);
        if (!created) {
            throw new AppError('Wallet already exists or creation failed', HttpStatusCode.BAD_REQUEST);
        }

        return { wallet: created, message: WALLET_RES_MESSAGES.create };
    }
}
