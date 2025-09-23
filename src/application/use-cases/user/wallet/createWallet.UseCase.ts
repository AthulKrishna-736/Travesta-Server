import { inject, injectable } from 'tsyringe';
import { AppError } from '../../../../utils/appError';
import { HttpStatusCode } from '../../../../constants/HttpStatusCodes';
import { TOKENS } from '../../../../constants/token';
import { IWalletRepository } from '../../../../domain/interfaces/repositories/walletRepo.interface';
import { ICreateWalletUseCase, TCreateWalletData } from '../../../../domain/interfaces/model/wallet.interface';
import { WALLET_RES_MESSAGES } from '../../../../constants/resMessages';
import { WALLET_ERROR_MESSAGES } from '../../../../constants/errorMessages';
import { TResponseWalletDTO } from '../../../../interfaceAdapters/dtos/wallet.dto';
import { ResponseMapper } from '../../../../utils/responseMapper';

@injectable()
export class CreateWalletUseCase implements ICreateWalletUseCase {
    constructor(
        @inject(TOKENS.WalletRepository) private _walletRepository: IWalletRepository,
    ) { }

    async createUserWallet(userId: string): Promise<{ wallet: TResponseWalletDTO, message: string }> {
        const walletExist = await this._walletRepository.findUserWallet(userId);

        if (walletExist) {
            throw new AppError(WALLET_ERROR_MESSAGES.exist, HttpStatusCode.CONFLICT);
        }

        const walledData: TCreateWalletData = {
            userId,
            balance: 0,
        }

        const created = await this._walletRepository.createWallet(walledData);
        if (!created) {
            throw new AppError(WALLET_ERROR_MESSAGES.createFail, HttpStatusCode.BAD_REQUEST);
        }

        const mappedWallet = ResponseMapper.mapWalletToResponseDTO(created)

        return { wallet: mappedWallet, message: WALLET_RES_MESSAGES.create };
    }
}
