import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../../../constants/token';
import { IWalletRepository } from '../../../../domain/interfaces/repositories/walletRepo.interface';
import { ICreateWalletUseCase, IGetWalletUseCase } from '../../../../domain/interfaces/model/wallet.interface';
import { WALLET_RES_MESSAGES } from '../../../../constants/resMessages';
import { TResponseWalletDTO } from '../../../../interfaceAdapters/dtos/wallet.dto';
import { ResponseMapper } from '../../../../utils/responseMapper';

@injectable()
export class GetWalletUseCase implements IGetWalletUseCase {
    constructor(
        @inject(TOKENS.WalletRepository) private _walletRepository: IWalletRepository,
        @inject(TOKENS.CreateWalletUseCase) private _createWalletUseCase: ICreateWalletUseCase,
    ) { }

    async getUserWallet(userId: string): Promise<{ wallet: TResponseWalletDTO | null, message: string }> {
        const walletDoc = await this._walletRepository.findUserWallet(userId);

        if (!walletDoc) {
            const { wallet } = await this._createWalletUseCase.createUserWallet(userId);
            return { wallet: wallet, message: WALLET_RES_MESSAGES.getWallet };
        }

        const mappedWallet = ResponseMapper.mapWalletToResponseDTO(walletDoc);
        return { wallet: mappedWallet, message: WALLET_RES_MESSAGES.getWallet };
    }
}
