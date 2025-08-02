import { inject, injectable } from 'tsyringe';
import { AppError } from '../../../../utils/appError';
import { HttpStatusCode } from '../../../../utils/HttpStatusCodes';
import { TOKENS } from '../../../../constants/token';
import { IWalletRepository } from '../../../../domain/interfaces/repositories/repository.interface';
import { ICreateWalletUseCase, IWallet } from '../../../../domain/interfaces/model/wallet.interface';

@injectable()
export class CreateWalletUseCase implements ICreateWalletUseCase {
    constructor(
        @inject(TOKENS.WalletRepository) private _walletRepo: IWalletRepository
    ) { }

    async execute(userId: string): Promise<IWallet> {
        const created = await this._walletRepo.createWallet(userId);
        if (!created) {
            throw new AppError('Wallet already exists or creation failed', HttpStatusCode.BAD_REQUEST);
        }

        return created;
    }
}
