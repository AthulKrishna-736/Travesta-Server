import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../constants/token';
import { IWalletRepository } from '../../../../domain/interfaces/repositories/repository.interface';
import { IGetWalletUseCase, IWallet } from '../../../../domain/interfaces/model/wallet.interface';

@injectable()
export class GetWalletUseCase implements IGetWalletUseCase {
    constructor(
        @inject(TOKENS.WalletRepository) private _walletRepo: IWalletRepository
    ) { }

    async getUserWallet(userId: string, page: number, limit: number): Promise<IWallet | null> {
        const wallet = await this._walletRepo.findByUserId(userId);

        return wallet;
    }
}
